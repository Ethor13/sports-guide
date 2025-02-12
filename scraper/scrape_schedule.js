import { scrapeEspnConfig, getTodayString } from "./helpers.js";
import { join } from "path";
import { writeFileSync } from "fs";

const CONFIG = {
    espnScheduleUrl: "https://www.espn.com/nba/schedule/_/date",
    outputPath: "c:/Users/ethor/python-docs/sports-guide/data/games",
    dateFormat: {
        timeZone: "America/New_York",
        timeZoneName: "short",
    },
};

/**
 * Extracts game details from event data
 * @param {Object} event - Event data from ESPN config
 * @returns {Object} Formatted game information
 */
function parseGameEvent(event) {
    return {
        gameId: parseInt(event.id),
        awayTeam: event.competitors.find((team) => !team.isHome).abbrev,
        homeTeam: event.competitors.find((team) => team.isHome).abbrev,
        // add time zone to the time locale string
        time: event.date,
        link: event.link,
        broadcasts: event.broadcasts.map((broadcast) => broadcast.name),
    };
}

/**
 * Groups events by date
 * @param {Object} configData - ESPN configuration data
 * @returns {Object} Events organized by date
 */
function getEventsByDate(configData) {
    try {
        const events = {};

        // Loop through each date in the events object
        Object.keys(configData).forEach((date) => {
            events[date] = configData[date].map(parseGameEvent);
        });

        return events;
    } catch (error) {
        throw new Error(`Failed to parse events: ${error.message}`);
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        // Fetch and parse schedule data
        const url = `${CONFIG.espnScheduleUrl}/${getTodayString()}`;
        const espnData = await scrapeEspnConfig(url);
        const eventsByDate = getEventsByDate(espnData.page.content.events);

        // Write results to files by date
        Object.entries(eventsByDate).forEach(([date, games]) => {
            const outputFile = join(CONFIG.outputPath, `${date}.json`);
            writeFileSync(outputFile, JSON.stringify(games, null, 2));
        });

        console.log(`Schedule data written to ${CONFIG.outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

main();
