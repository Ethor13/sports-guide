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
            
            const data = await response.json();
            setGames(data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="loading">Loading games...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!games.length) return <div className="no-games">No games scheduled</div>;

    return (
        <div className="games-grid">
            {games.map(game => (
                <GameCard key={game.id} game={game} />
            ))}
        </div>
    );
};

export default GamesList;
