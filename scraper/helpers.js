import fetch from "node-fetch";

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
 * Scrapes ESPN configuration data from URL
 * @param {string} url - URL to scrape
 * @returns {Promise<Object>} Parsed ESPN configuration data
 * @throws {Error} If scraping or parsing fails
 */
async function scrapeEspnConfig(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const match = html.match(CONFIG.espnConfigRegex);

        if (!match?.[1]) {
            throw new Error("ESPN configuration data not found in page");
        }

        return JSON.parse(match[1]);
    } catch (error) {
        throw new Error(`ESPN data scraping failed: ${error.message}`);
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

export { scrapeEspnConfig, getTodayString };
