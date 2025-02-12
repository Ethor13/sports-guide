import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { scrapeEspnConfig, getTodayString } from "./helpers.js";

const CONFIG = {
    url: "https://www.espn.com/nba/bpi",
    outputDir: "c:/Users/ethor/python-docs/sports-guide/data/bpi",
    fields: ["abbrev", "numwins", "bpi", "bpirank", "bpioffense", "bpidefense", "playoffbpi"],
};

/**
 * Ensures the data directory exists
 * @param {string} dirPath - Directory path to create
 */
function ensureDirectoryExists(dirPath) {
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Transforms BPI data into CSV format
 * @param {Array} bpiData - Array of team BPI data
 * @returns {string} CSV formatted string
 */
function transformToCsv(bpiData) {
    const header = CONFIG.fields.join(",");

    const rows = bpiData.map((teamData) => {
        const stats = teamData.stats.reduce((acc, stat) => {
            acc[stat.name] = stat.value;
            return acc;
        }, {});

        return CONFIG.fields.map((field) => stats[field] || teamData.team[field]).join(",");
    });

    return [header, ...rows].join("\n");
}

/**
 * Main execution function
 */
export async function scrape_bpi() {
    try {
        ensureDirectoryExists(CONFIG.outputDir);
        const outputPath = join(CONFIG.outputDir, `${getTodayString()}.csv`);

        // Skip if already scraped today
        if (existsSync(outputPath)) {
            console.log("BPI data already exists for today");
            return;
        }

        // Fetch and process BPI data
        const espnData = await scrapeEspnConfig(CONFIG.url);
        const bpiData = espnData.page.content.table.stats;
        const csvContent = transformToCsv(bpiData);

        writeFileSync(outputPath, csvContent);
        console.log(`BPI data written to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}
