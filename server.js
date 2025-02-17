import express from "express";
import { score_games } from "./scraper/calculate_slate_scores.js";
import { getTodayString } from "./scraper/helpers.js";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

app.get("/api/slate-scores/:sport", async (req, res) => {
    const { sport } = req.params;
    console.log(sport);
    const tomorrow = getTodayString(0);
    const games = await score_games(tomorrow, sport);
    res.json(games);
});

app.get("/i/*", async (req, res) => {
    const ESPN_ROOT = "https://a.espncdn.com";
    const localPath = join("img", req.params[0]);

    if (!existsSync(localPath)) {
        const localDir = join(...localPath.split("\\").slice(0, -1));
        mkdirSync(localDir, { recursive: true });

        fetch(join(ESPN_ROOT, "i", req.params[0]))
            .then((response) => response.arrayBuffer())
            .then((buffer) => writeFileSync(localPath, Buffer.from(buffer)));
    }

    res.sendFile(localPath, { root: process.cwd() });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
