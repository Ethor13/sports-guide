import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { scrape_bpi } from "./scrape_bpi.js";
import { scrapeEspnConfig, getTodayString } from "./helpers.js";

const CONFIG = {
    paths: {
        bpiDir: "c:/Users/ethor/python-docs/sports-guide/data/bpi",
        gamesDir: "c:/Users/ethor/python-docs/sports-guide/data/games",
    },
    weights: {
        winProbability: 0.3,
        record: 0.2,
        bpi: 0.5,
    },
    bpi: { sigmoidScale: 3 },
    espn: { baseUrl: "https://www.espn.com" },
};

/**
 * Extracts team details from ESPN data structure
 * @param {Object} teamData - Raw team data from ESPN
 * @returns {TeamInfo} Structured team information
 */
function extractTeamDetails(teamData) {
    const totalRecord = teamData.records.find((record) => record.type === "total");
    return {
        abbreviation: teamData.abbrev,
        record: totalRecord?.summary || "0-0",
    };
}

/**
 * Fetches and processes game information
 * @param {string} gameUrl - ESPN game URL
 * @returns {Promise<GameInfo>} Processed game information
 */
async function fetchGameDetails(gameUrl) {
    try {
        const espnData = await scrapeEspnConfig(gameUrl);
        const gameData = espnData.page.content.gamepackage;
        const matchupPredictor = gameData.mtchpPrdctr;

        return {
            awayTeam: {
                ...extractTeamDetails(gameData.gmStrp.tms[1]),
                winProbability: matchupPredictor?.teams[0].value,
            },
            homeTeam: {
                ...extractTeamDetails(gameData.gmStrp.tms[0]),
                winProbability: matchupPredictor?.teams[1].value,
            },
            odds: gameData.gameOdds?.odds || [],
        };
    } catch (error) {
        throw new Error(`Game data fetch failed: ${error.message}`);
    }
}

/**
 * Calculates win percentage from W-L record
 * @param {string} record - Format: "W-L"
 * @returns {number} Win percentage
 */
function calculateWinPercentage(record) {
    const [wins, losses] = record.split("-").map(Number);
    return wins / (wins + losses);
}

/**
 * Normalizes BPI using sigmoid function
 * @param {number} bpi - Basketball Power Index value
 * @returns {number} Normalized value between 0 and 1
 */
function normalizeBpi(bpi) {
    return 1 / (1 + Math.exp(-bpi / CONFIG.bpi.sigmoidScale));
}

/**
 * Calculates game interest score
 * @param {GameInfo} gameInfo - Complete game information
 * @returns {number} Interest score between 0 and 1
 */
function calculateInterestScore(gameInfo) {
    const { awayTeam, homeTeam } = gameInfo;

    // Win probability component
    const probabilityDelta = Math.abs(awayTeam.winProbability - homeTeam.winProbability);
    const probabilityScore = 1 - probabilityDelta / 100;

    // Team record component
    const averageWinRate =
        (calculateWinPercentage(awayTeam.record) + calculateWinPercentage(homeTeam.record)) / 2;

    // BPI component
    const averageBpi = (normalizeBpi(awayTeam.bpi) + normalizeBpi(homeTeam.bpi)) / 2;

    return (
        probabilityScore * CONFIG.weights.winProbability +
        averageWinRate * CONFIG.weights.record +
        averageBpi * CONFIG.weights.bpi
    );
}

/**
 * Parses BPI CSV data into team-indexed object
 * @param {string} csvContent - Raw CSV content
 * @returns {Object<string, TeamBPI>} BPI data by team
 */
function parseBpiData(csvContent) {
    const [headerRow, ...dataRows] = csvContent.trim().split("\n");
    const headers = headerRow.split(",");

    return dataRows.reduce((teams, row) => {
        const values = row.split(",");
        const teamData = headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});

        teams[teamData.abbrev] = teamData;
        return teams;
    }, {});
}

/**
 * Gets BPI data for today, fetching if necessary
 * @returns {Promise<Object>} BPI data indexed by team abbreviation
 */
async function getBpiData() {
    const bpiPath = join(CONFIG.paths.bpiDir, `${getTodayString()}.csv`);

    if (!existsSync(bpiPath)) {
        await scrape_bpi();
    }

    const bpiContent = readFileSync(bpiPath, "utf8");
    return parseBpiData(bpiContent);
}

/**
 * Scores a specific game by its link
 * @param {string} gameLink - ESPN game link
 * @returns {Promise<{gameInfo: GameInfo, score: number}>}
 */
async function score_game(gameLink) {
    try {
        const gameInfo = await fetchGameDetails(`${CONFIG.espn.baseUrl}${gameLink}`);
        const bpiData = await getBpiData();

        gameInfo.awayTeam.bpi = parseFloat(bpiData[gameInfo.awayTeam.abbreviation].bpi);
        gameInfo.homeTeam.bpi = parseFloat(bpiData[gameInfo.homeTeam.abbreviation].bpi);

        return {
            gameInfo,
            slateScore: calculateInterestScore(gameInfo),
        };
    } catch (error) {
        console.error(`Failed to score game ${gameLink}:`, error.message);
        return null;
    }
}

/**
 * Scores all games for a given date
 * @param {string} date - Date in format MM/DD/YYYY
 * @returns {Promise<Array>} Sorted array of games with scores
 */
export async function score_games(date) {
    try {
        // Read games file for the date
        const gamesPath = join(CONFIG.paths.gamesDir, `${date}.json`);
        const gamesData = JSON.parse(readFileSync(gamesPath, "utf8"));

        // Score each game
        const scoredGames = [];
        for (const game of gamesData) {
            const result = await score_game(game.link);
            if (result) {
                scoredGames.push({
                    ...game,
                    ...result.gameInfo,
                    slateScore: result.slateScore,
                });
            }
        }

        // Sort by interest score descending
        scoredGames.sort((a, b) => b.slateScore - a.slateScore);

        return scoredGames;
    } catch (error) {
        if (error.code === "ENOENT") {
            console.error(`No games found for date ${date}`);
        } else {
            console.error(`Error scoring games for ${date}:`, error.message);
        }
        return [];
    }
}

// Update main execution
const today = getTodayString(1);
score_games(today);
