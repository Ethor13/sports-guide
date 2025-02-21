import React from "react";
import "./GameCard.css";
import { getInterestLevel, formatGameTime } from "../helpers";

const GameCard = ({ game, showGameTime }) => {
    const interestLevel = getInterestLevel(game.slateScore);
    const leagueLogo = `/img/leaguelogos/${game.sport}.png`;

    return (
        <div className={`game-card ${interestLevel.className}`}>
            <div className="game-header">
                <div className="interest-level">
                    {interestLevel.rating}
                </div>
            </div>
            <div className="game-body">
                {/* <img src={leagueLogo} alt="League Logo" className="league-logo" /> */}
                <div className="game-info">
                    <div className="matchup">
                        <TeamInfo homeAway="away" team={game.away} />
                        <div className="matchup-divider">
                            <div className="versus">@</div>
                            {showGameTime && (
                                <div className="card-game-time">
                                    {formatGameTime(game.date)}
                                </div>
                            )}
                        </div>
                        <TeamInfo homeAway="home" team={game.home} />
                    </div>
                    <Broadcasts broadcasts={game.broadcasts} />
                </div>
            </div>
        </div>
    );
};

const TeamInfo = ({ homeAway, team }) => {
    return (
        <div className={`team ${homeAway}`}>
            <div className="team-info">
                <div className="team-summary">
                    <span className="team-name">{team.shortName}</span>
                    <div className="team-stats">
                        <span className="team-record">({team.record})</span>
                        {team.matchupQualities && (
                            <span className="win-prob">
                                {team.matchupQualities.teampredwinpct.toFixed(0)}%
                            </span>
                        )}
                    </div>
                </div>
                <img className="team-logo" src={team.logo.split(".com")[1]} alt="" />
            </div>
        </div>
    );
};

const Broadcasts = ({ broadcasts }) => {
    if (!Object.keys(broadcasts).length) {
        return (
            <div className="broadcasts">
                <span className="no-broadcasts-tag">No Broadcasts Available</span>
            </div>
        );
    }

    return (
        <div className="broadcasts">
            {Object.keys(broadcasts).map((broadcast, index) => (
                <span key={index} id={index} className="broadcast-tag">
                    {broadcast}
                </span>
            ))}
        </div>
    );
};

export default GameCard;
