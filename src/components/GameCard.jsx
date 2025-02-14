import React from 'react';
import './GameCard.css';

const formatGameTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        // weekday: 'short',
        // month: 'short',
        // day: 'numeric',
        hour12: true
    });
};

const getInterestLevel = (score) => {
    if (score >= 0.8) return { label: "Must Watch", className: "must-watch" };
    if (score >= 0.6) return { label: "High Interest", className: "high-interest" };
    if (score >= 0.4) return { label: "Decent", className: "decent" };
    return { label: "Low Interest", className: "low-interest" };
};

const GameCard = ({ game }) => {
    const interestLevel = getInterestLevel(game.slateScore);

    return (
        <div className={`game-card ${interestLevel.className}`}>
            <div className="game-header">
                <span className="game-time">{formatGameTime(game.time)}</span>
                <span className="interest-badge">
                    <div>{interestLevel.label}</div>
                    <div>{100 * game.slateScore.toFixed(2)}</div>
                </span>
            </div>
            <div className="matchup">
                <TeamInfo team={game.awayTeam} />
                <div className="versus">@</div>
                <TeamInfo team={game.homeTeam} />
            </div>
            <div className="broadcasts">
                {game.broadcasts.map((broadcast, index) => (
                    <span key={index} className="broadcast-tag">{broadcast}</span>
                ))}
            </div>
        </div>
    );
};

const TeamInfo = ({ team }) => (
    <div className="team">
        <span className="team-name">{team.abbreviation}</span>
        <span className="team-record">{team.record}</span>
        <span className="win-prob">{team.winProbability}%</span>
    </div>
);

export default GameCard;
