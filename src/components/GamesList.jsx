import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';
import './GamesList.css';

const GamesList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/slate-scores');
            if (!response.ok) throw new Error('Failed to fetch games');

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
            {Object.entries(games)
                .sort(([_, a], [__, b]) => b.slateScore - a.slateScore)
                .map(([gameId, game]) => ( <GameCard key={gameId} game={game} />))}
        </div>
    );
};

export default GamesList;
