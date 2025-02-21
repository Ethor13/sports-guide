import React, { useState, useEffect } from "react";
import GameCard from "./GameCard";
import "./GamesList.css";
import { formatGameTime } from "../helpers";

const GamesList = ({ sports, date, sortBy }) => {
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);

    const fetchGames = async () => {
        if (!sports) {
            setGames({});
            return;
        }
        try {
            // make the cursor spinny to indicate loading
            document.body.classList.add("loading");

            const formattedDate = date
                ? new Date(date).toLocaleDateString("en-CA").replaceAll("-", "")
                : "";

            // Updated endpoint to use query parameters: sports and date
            let endpoint = `/api/slate-scores?date=${formattedDate}`;
            endpoint += sports.length > 0 ? `&sports=${sports.join(",")}` : "";

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Failed to fetch games");

            const games = await response.json();
            setGames(games || {});
            setError(null);

            // Reset loading class
            document.body.classList.remove("loading");
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchGames();
    }, [sports, date]); // re-fetch when sport or date changes

    const split_by_time = (games) => {
        let games_by_time = {};
        Object.values(games).forEach((game) => {
            if (!(game.date in games_by_time)) {
                games_by_time[game.date] = [];
            }
            games_by_time[game.date].push(game);
        });
        return games_by_time;
    };

    const renderGames = () => {
        if (sortBy === "time") {
            return (
                Object.entries(split_by_time(games))
                    .sort(([timeA], [timeB]) => new Date(timeA) - new Date(timeB))
                    .map(([gameTime, games]) => (
                        <div key={gameTime} className="games-group">
                            <h2 className="game-time">{formatGameTime(gameTime)}</h2>
                            {games
                                .sort((game1, game2) => game2.slateScore - game1.slateScore)
                                .map((game) => (
                                    <GameCard key={game.id} game={game} showGameTime={false} />
                                ))}
                        </div>
                    ))
            );
        } else {
            // Sort by slate score
            return (
                <div className="games-group">
                    {Object.values(games)
                        .sort((game1, game2) => game2.slateScore - game1.slateScore)
                        .map((game) => (
                            <GameCard key={game.id} game={game} showGameTime={true} />
                        ))}
                </div>
            );
        }
    };

    if (error) return <div className="error">Error: {error}</div>;
    if (!Object.keys(games).length) return <div className="no-games">No games scheduled</div>;

    return (
        <div className="games-grid">
            {renderGames()}
        </div>
    );
};

export default GamesList;
