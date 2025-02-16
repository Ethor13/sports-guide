import React, { useState, useEffect } from "react";
import GameCard from "./GameCard";
import "./GamesList.css";
import { formatGameTime } from "../helpers";

const GamesList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/slate-scores");
            if (!response.ok) throw new Error("Failed to fetch games");

            const games = await response.json();
            setGames(games || {});
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    if (loading) return <div className="loading">Loading games...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!Object.keys(games).length) return <div className="no-games">No games scheduled</div>;

    return (
        <div className="games-grid">
            {Object.entries(split_by_time(games))
                .sort(([timeA], [timeB]) => new Date(timeA) - new Date(timeB))
                .map(([gameTime, games]) => (
                    <div key={gameTime} className="games-group">
                        <h2 className="game-time">{formatGameTime(gameTime)}</h2>
                        {games
                            .sort((game1, game2) => game2.slateScore - game1.slateScore)
                            .map((game) => (
                                <GameCard key={game.id} game={game} />
                            ))}
                    </div>
                ))}
        </div>
    );
};

function split_by_time(games) {
    let games_by_time = {};
    Object.values(games).forEach((game) => {
        if (!(game.date in games_by_time)) {
            games_by_time[game.date] = [];
        }
        games_by_time[game.date].push(game);
    });
    return games_by_time;
}

export default GamesList;
