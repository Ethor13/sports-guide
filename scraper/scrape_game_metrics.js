import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import {
    combine_maps,
    ensureDirectoryExists,
    getTodayString,
    mappify,
    scrapeUrl,
} from "./helpers.js";

const CONFIG = {
    outputDirs: {
        powerIndex: "c:/Users/ethor/python-docs/sports-guide/data/power-index",
        matchupQuality: "c:/Users/ethor/python-docs/sports-guide/data/matchup-quality",
    },
    sports: {
        nba: {
            powerIndex: (date) =>
                "https://site.web.api.espn.com/apis/fitt/v3/sports/basketball/nba/powerindex?limit=1000",
            matchupQuality: (date) =>
                `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/dailypowerindex?limit=1000&dates=${date}`,
        },
        ncaambb: {
            powerIndex: (date) =>
                "https://site.web.api.espn.com/apis/fitt/v3/sports/basketball/mens-college-basketball/powerindex?limit=1000",
            matchupQuality: (date) =>
                `https://site.web.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/dailypowerindex?limit=1000&groups=50&dates=${date}`,
        },
    },
    parsers: {
        powerIndex: parsePowerIndex,
        matchupQuality: parseMatchupQuality,
    },
};

function parsePowerIndex(espnData) {
    return combine_maps(
        espnData.teams.map((team) => ({
            [team.team.id]: {
                name: team.team.displayName,
                shortName: team.team.shortDisplayName,
                abbreviation: team.team.abbreviation,
                divisionName: team.team.group.shortName,
                conferenceName: team.team.group.parent.shortName,
                logo: team.team.logos[0].href,
                powerIndexes: combine_maps(
                    team.categories.map((statCategory) => ({
                        [statCategory.name]: mappify(
                            espnData.categories.find(
                                (category) => category.name === statCategory.name
                            ).names,
                            statCategory.values
                        ),
                    }))
                ),
            },
        }))
    );
}

function parseMatchupQuality(espnData) {
    return combine_maps(
        espnData.events.map((event) => {
            const matchupQualities = combine_maps(
                event.competitions[0].powerIndexes?.map((teamPowerIndexes) => ({
                    [teamPowerIndexes.id]: combine_maps(
                        teamPowerIndexes.stats.map((stat) => ({ [stat.name]: stat.value }))
                    ),
                }))
            );

            return {
                [event.id]: {
                    ...combine_maps(
                        event.competitions[0].competitors.map((team) => ({
                            [team.homeAway]: {
                                id: team.team.id,
                                name: team.team.displayName,
                                shortName: team.team.shortDisplayName,
                                abbreviation: team.team.abbreviation,
                                logo: team.team.logos?.[0].href,
                                matchupQualities: matchupQualities?.[team.team.id],
                            },
                        }))
                    ),
                    date: event.date,
                    link: event.competitions[0].links.find((link) => link.text === "Gamecast").href,
                    broadcasts: combine_maps(
                        event.competitions[0].geoBroadcasts.map((broadcast) => ({
                            [broadcast.media.shortName]: {
                                market: broadcast.market.type,
                                type: broadcast.type.shortName,
                            },
                        }))
                    ),
                },
            };
        })
    );
}

export async function scrapeGameMetrics(date, sport) {
    const sport_config = CONFIG.sports[sport];

    for (const [urlType, getUrl] of Object.entries(sport_config)) {
        const outputDir = join(CONFIG.outputDirs[urlType], sport);
        const outputPath = join(outputDir, `${date}.json`);

        // Skip if already scraped today
        if (existsSync(outputPath)) {
            console.log(`${urlType} data already exists for today`);
            continue;
        }

        ensureDirectoryExists(outputDir);
        const espnData = await scrapeUrl(getUrl(date));
        const parsedData = CONFIG.parsers[urlType](espnData);
        writeFileSync(outputPath, JSON.stringify(parsedData, null, 2));
        console.log(`${urlType} data written to ${outputPath}`);
    }
}

const today = getTodayString(1);
scrapeGameMetrics(today, "ncaambb");
