import express from "express";
import { score_sports_games } from "./scraper/calculate_slate_scores.js";
import { getTodayString } from "./scraper/helpers.js";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

app.get("/api/slate-scores", async (req, res) => {
    const { sports, date } = req.query;

    if (!date) {
        res.status(400).json({ error: "Missing required parameters: date" });
        return;
    }

    try {
        const games = await score_sports_games(date, sports ? sports.split(",") : []);
        res.json(games);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching scores." });
    }
});

app.get("/i/*", async (req, res) => {
    const ESPN_ROOT = "https://a.espncdn.com";
    const localPath = join("img", req.params[0]);

    if (!existsSync(localPath)) {
        const localDir = join(...localPath.split("\\").slice(0, -1));
        mkdirSync(localDir, { recursive: true });

        const espnUrl = join(ESPN_ROOT, "i", req.params[0]);
        const response = await fetch(espnUrl);
        try {
            const buffer = await response.arrayBuffer();
            writeFileSync(localPath, Buffer.from(buffer));
        } catch (error) {
            console.error(error);
            console.log(localPath);
            console.log(espnUrl);
            console.log(buffer);
            res.status(500).json({ error: "An error occurred while fetching the image." });
        }
    }

    res.sendFile(localPath, { root: process.cwd() });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
