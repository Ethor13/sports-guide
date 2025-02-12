import express from "express";
import { score_games } from "./scraper/calculate_slate_scores.js";
import { getTodayString } from "./scraper/helpers.js";

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

app.get("/api/slate-scores", async (req, res) => {
    const tomorrow = getTodayString(1);
    const gameScores = await score_games(tomorrow);
    res.json(gameScores);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
