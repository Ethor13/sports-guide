import fetch from "node-fetch";
import { existsSync, mkdirSync } from "fs";

const CONFIG = {
    espnConfigRegex: /window\['__espnfitt__'\]\s*=\s*({[\s\S]*?});/,
    dateOptions: {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    },
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
 * Scrapes ESPN configuration data from URL
 * @param {string} url - URL to scrape
 * @returns {Promise<Object>} Parsed ESPN configuration data
 * @throws {Error} If scraping or parsing fails
 */
async function scrapeUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.text();
        return JSON.parse(json);
    } catch (error) {
        throw new Error(`Scraping URL failed: ${error.message}`);
    }
}

/**
 * Gets today's date in YYYYMMDD format for ESPN URLs
 * @returns {string} Date string in YYYYMMDD format
 */
function getTodayString(offset = 0) {
    const today = new Date();
    today.setDate(today.getDate() + offset);
    const [month, day, year] = new Intl.DateTimeFormat("en-US", CONFIG.dateOptions)
        .format(today)
        .split("/");
    return `${year}${month}${day}`;
}

function mappify(keys, values) {
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}

function combine_maps(maps) {
    return Object.assign({}, ...(maps || []));
}

function deepMerge(target, source) {
    const merged = { ...target };

    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
            merged[key] = deepMerge(merged[key], source[key]);
        } else {
            merged[key] = source[key];
        }
    }

    return merged;
}

export { ensureDirectoryExists, scrapeUrl, getTodayString, mappify, combine_maps, deepMerge };
export const formatGameTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        // weekday: 'short',
        // month: 'short',
        // day: 'numeric',
        hour12: true,
    });
};
