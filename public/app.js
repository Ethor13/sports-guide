/**
 * Creates a game card element
 * @param {Object} game - Game data with scores
 * @returns {string} HTML for game card
 */
function createGameCard(game) {
    const interestLevel = getInterestLevel(game.slateScore);

    return `
		<div class="game-card ${interestLevel.className}">
			<div class="game-header">
				<span class="game-time">${game.time}</span>
				<span class="interest-badge" title="Interest Score: ${game.slateScore.toFixed(3)}">
					${interestLevel.label} (${game.slateScore.toFixed(3)})
				</span>
			</div>
			<div class="matchup">
				<div class="team away">
					<span class="team-name">${game.awayTeam.abbreviation}</span>
					<span class="team-record">${game.awayTeam.record}</span>
					<span class="win-prob">${game.awayTeam.winProbability}%</span>
				</div>
				<div class="versus">@</div>
				<div class="team home">
					<span class="team-name">${game.homeTeam.abbreviation}</span>
					<span class="team-record">${game.homeTeam.record}</span>
					<span class="win-prob">${game.homeTeam.winProbability}%</span>
				</div>
			</div>
			<div class="broadcasts">
				${game.broadcasts.map((b) => `<span class="broadcast-tag">${b}</span>`).join("")}
			</div>
		</div>
	`;
}

/**
 * Determines interest level styling based on score
 * @param {number} score - Interest score between 0 and 1
 * @returns {Object} Styling information
 */
function getInterestLevel(score) {
    if (score >= 0.8) return { label: "Must Watch", className: "must-watch" };
    if (score >= 0.6) return { label: "High Interest", className: "high-interest" };
    if (score >= 0.4) return { label: "Decent", className: "decent" };
    return { label: "Low Interest", className: "low-interest" };
}

/**
 * Loads and displays slate scores
 */
async function loadSlateScores() {
    const container = document.getElementById("games-container");

    try {
        container.innerHTML = '<div class="loading">Loading games...</div>';

        const response = await fetch("/api/slate-scores");
        if (!response.ok) throw new Error("Failed to fetch games");

        const games = await response.json();

        if (games.length === 0) {
            container.innerHTML = '<div class="no-games">No games scheduled for today</div>';
            return;
        }

        console.log(games);
        console.log(createGameCard(games[0]));
        // console.log(`${Array.from(games).map(createGameCard).join("")}`);
        container.innerHTML = `
            <div class="games-grid">
                ${Array.from(games).map(createGameCard).join("")}
            </div>
        `;
        console.log("done");
    } catch (error) {
        container.innerHTML = `<div class="error">Error loading games: ${error.message}</div>`;
    }
}

// Load games on page load
document.addEventListener("DOMContentLoaded", loadSlateScores);

// Refresh every 5 minutes
setInterval(loadSlateScores, 300000);
