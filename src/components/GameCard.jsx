import React from 'react';
import './GameCard.css';
import { formatGameTime, getInterestLevel } from '../helpers';

const GameCard = ({ game }) => {
    const interestLevel = getInterestLevel(game.slateScore);

    return (
        <div className={`game-card ${interestLevel.className}`}>
            <div className="game-header">
                <span className="game-time">{formatGameTime(game.date)}</span>
                <span className="interest-badge">
                    <div>{interestLevel.label}</div>
                    <div>{(100 * game.slateScore).toFixed(0)}</div>
                </span>
            </div>
            <div className="matchup">
                <TeamInfo team={game.away} />
                <div className="versus">@</div>
                <TeamInfo team={game.home} />
            </div>
            <div className="broadcasts">
                {Object.keys(game.broadcasts).map((broadcast, index) => (
                    <span key={index} id={index} className="broadcast-tag">{broadcast}</span>
                ))}
            </div>
        </div>
    );
};

const TeamInfo = ({ team }) => (
    <div className="team">
        <span className="team-name">{team.shortName}</span>
        <span className="team-record">{team.record}</span>
        <span className="win-prob">{team.matchupQualities.teampredwinpct.toFixed(0)}%</span>
    </div>
);

export default GameCard;
