import { getTodayString, scrapeUrl, ensureDirectoryExists, combine_maps } from "./helpers.js";
import { join } from "path";
import { existsSync, writeFileSync } from "fs";

const CONFIG = {
    outputDir: "c:/Users/ethor/python-docs/sports-guide/data/games",
    dateFormat: {
        timeZone: "America/New_York",
        timeZoneName: "short",
    },
    sports: {
        nba: (date) =>
            `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?limit=1000&groups=50&dates=${date}`,
        cbb: (date) =>
            `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?limit=1000&groups=50&dates=${date}`,
    },
};

/**
 * Extracts game details from event data
 * @param {Object} events - Event data from ESPN config
 * @returns {Object} Formatted game information
 */
function parseEvents(events) {
    return combine_maps(
        events.events.map((event) => ({
            [event.id]: {
                ...combine_maps(
                    event.competitions[0].competitors.map((team) => ({
                        [team.homeAway]: {
                            id: team.team.id,
                            name: team.team.displayName,
                            shortName: team.team.shortDisplayName,
                            abbreviation: team.team.abbreviation,
                            logo: team.team.logo,
                            record: team.records.find((record) => record.type === "total").summary,
                        },
                    }))
                ),
                date: event.date,
                link: event.links.find((link) => link.text === "Gamecast").href,
                broadcasts: combine_maps(
                    event.competitions[0].geoBroadcasts.map((broadcast) => ({
                        [broadcast.media.shortName]: {
                            market: broadcast.market.type,
                            type: broadcast.type.shortName,
                        },
                    }))
                ),
            },
        }))
    );
}

/**
 * Main execution function
 */
export async function scrapeSchedule(date, sport) {
    try {
        // Fetch and parse schedule data
        const outputDir = join(CONFIG.outputDir, sport);
        const outputPath = join(outputDir, `${date}.json`);

        // Skip if already scraped today
        if (existsSync(outputPath)) {
            console.log("Schedule data already exists for today");
            return;
        }

        const espnData = await scrapeUrl(CONFIG.sports[sport](date));
        const parsedSchedule = parseEvents(espnData);

        ensureDirectoryExists(outputDir);
        writeFileSync(outputPath, JSON.stringify(parsedSchedule, null, 2));
        console.log(`Schedule data written to ${outputDir}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

const today = getTodayString(1);
scrapeSchedule(today, "cbb");
