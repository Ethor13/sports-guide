import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { scrapeGameMetrics } from "./scrape_game_metrics.js";
import { scrapeSchedule } from "./scrape_schedule.js";
import { deepMerge, getTodayString } from "./helpers.js";
import { calculateGameMetrics } from "./calculate_game_metrics.js";

const CONFIG = {
    paths: {
        powerIndexDir: "c:/Users/ethor/python-docs/sports-guide/data/power-index",
        matchupQualityDir: "c:/Users/ethor/python-docs/sports-guide/data/matchup-quality",
        gamesDir: "c:/Users/ethor/python-docs/sports-guide/data/games",
    },
    categories: {
        allData: {
            weights: {
                matchupQuality: 0.4,
                winProbability: 0.25,
                record: 0.2,
                powerIndex: 0.1,
                spread: 0.05,
            },
            scalingFactors: {
                powerIndex: 3,
                spread: 50,
            },
            getGameMetricsFunc: getGameMetricsAllData,
            getInterestScoreFunc: calculateInterestScoreAllData,
        },
    },
    sports: {
        nba: "allData",
        cbb: "allData",
    },
};

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
 * Normalizes value using sigmoid function
 * @param {number} x - value
 * @returns {number} Normalized value between 0 and 1
 */
function sigmoid(x, scale) {
    return 1 / (1 + Math.exp(-x / scale));
}

/**
 * Normalizes value using sigmoid function
 * @param {number} x - value
 * @returns {number} Normalized value between 0 and 1
 */
function neg_exp(x, scale) {
    return Math.exp(-Math.pow(x, 2) / scale);
}

/**
 * Calculates game interest score
 * @param {GameInfo} game - Game information
 * @returns {number} Interest score between 0 and 1
 */
function calculateInterestScorePartial(game) {
    const { home, away } = game;

    // Win probability component
    const probabilityDelta = Math.abs(home.probability - away.probability);
    const probabilityScore = 1 - probabilityDelta / 100;

    // Team record component
    const averageWinRate =
        (calculateWinPercentage(game.home.record) + calculateWinPercentage(game.away.record)) / 2;

    // Power Index component
    const averagePowerIndex =
        (sigmoid(home.powerIndex, CONFIG.scalingFactors.powerIndex) +
            sigmoid(away.powerIndex, CONFIG.scalingFactors.powerIndex)) /
        2;

    return (
        probabilityScore * CONFIG.weights.winProbability +
        averageWinRate * CONFIG.weights.record +
        averagePowerIndex * CONFIG.weights.powerIndex
    );
}

/**
 * Calculates game interest score
 * @param {GameInfo} game - Game information
 * @returns {number} Interest score between 0 and 1
 */
function calculateInterestScoreAllData(game) {
    // Corresponds with "AllData" Category
    const config = CONFIG.categories.allData;
    const { home, away } = game;

    const homeMQ = home.matchupQualities;
    const homePI = home.powerIndexes;
    const awayMQ = away.matchupQualities;
    const awayPI = away.powerIndexes;

    // Matchup quality component
    const matchupQuality = homeMQ.matchupquality / 100;

    // Win probability component
    const probabilityDelta = Math.abs(homeMQ.teampredwinpct - awayMQ.teampredwinpct);
    const probabilityScore = 1 - probabilityDelta / 100;

    // Record component
    const homeWinRate = calculateWinPercentage(home.record);
    const awayWinRate = calculateWinPercentage(away.record);
    const averageWinRate = (homeWinRate + awayWinRate) / 2;

    // Power Index component
    const homePowerIndex = sigmoid(homePI.bpi.bpi, config.scalingFactors.powerIndex);
    const awayPowerIndex = sigmoid(awayPI.bpi.bpi, config.scalingFactors.powerIndex);
    const averagePowerIndex = (homePowerIndex + awayPowerIndex) / 2;

    // Spread component
    const spreadScore = neg_exp(homeMQ.teampredmov, config.scalingFactors.spread);

    return (
        matchupQuality * config.weights.matchupQuality +
        probabilityScore * config.weights.winProbability +
        averageWinRate * config.weights.record +
        averagePowerIndex * config.weights.powerIndex +
        spreadScore * config.weights.spread
    );
}

/**
 * Gets Schedule data for today, fetching if necessary
 * @param {string} date - Date in format MM/DD/YYYY
 * @param {string} sport - Sport abbreviation
 * @returns {Promise<Object>} Schedule data
 */
async function getScheduleData(date, sport) {
    await scrapeSchedule(date, sport);
    const gamesPath = join(CONFIG.paths.gamesDir, sport, `${date}.json`);
    return JSON.parse(readFileSync(gamesPath, "utf8"));
}

/**
 * Gets Power Index data for today, fetching if necessary
 * @returns {Promise<Object>} Power Index data indexed by team abbreviation
 */
async function getGameMetricsAllData(date, sport) {
    await scrapeGameMetrics(date, sport);

    const powerIndexPath = join(CONFIG.paths.powerIndexDir, sport, `${date}.json`);
    const powerIndexData = JSON.parse(readFileSync(powerIndexPath, "utf8"));

    const matchupQualityPath = join(CONFIG.paths.matchupQualityDir, sport, `${date}.json`);
    const matchupQualityData = JSON.parse(readFileSync(matchupQualityPath, "utf8"));

    return Object.fromEntries(
        Object.entries(matchupQualityData).map(([gameId, matchupQuality]) => [
            gameId,
            {
                ...matchupQuality,
                home: { ...powerIndexData[matchupQuality.home.id], ...matchupQuality.home },
                away: { ...powerIndexData[matchupQuality.away.id], ...matchupQuality.away },
            },
        ])
    );
}

/**
 * Scores all games for a given date
 * @param {string} date - Date in format MM/DD/YYYY
 * @param {string} sport - Sport abbreviation
 * @returns {Promise<Array>} Sorted array of games with scores
 */
export async function score_games(date, sport) {
    const sports_config = CONFIG.categories[CONFIG.sports[sport]];

    const games = deepMerge(
        await getScheduleData(date, sport),
        await sports_config.getGameMetricsFunc(date, sport)
    );

    const scoredGames = Object.fromEntries(
        Object.entries(games).map(([gameId, game]) => [
            gameId,
            { ...game, slateScore: sports_config.getInterestScoreFunc(game) },
        ])
    );

    return scoredGames;
}

// Update main execution
const today = getTodayString(1);
score_games(today, "cbb");
