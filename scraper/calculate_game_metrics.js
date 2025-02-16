// https://www.pinnacle.com/betting-resources/en/football/pythagorean-theorem-strategy-for-betting-on-the-nfl/kma2rvxf92z7c288
// https://www.boydsbets.com/home-field-advantage/
// https://www.basketball-reference.com/leagues/NBA_stats_per_game.html
const CONFIG = {
    nba: {
        homeCourtAdvantage: 2.5,
        averageTotalPoints: 226,
        pythagoreanExponent: 16.5,
    },
    cbb: {
        homeCourtAdvantage: 3.5,
        averageTotalPoints: 140,
        pythagoreanExponent: 11.5,
    },
};

/**
 * Calculates the point spread for a home team based on Power Index and home court advantage
 * @param {number} homePowerIndex - The Power Index rating of the home team
 * @param {number} awayPowerIndex - The Power Index rating of the away team
 * @param {string} sport - The sport to calculate the spread for
 * @returns {number} The calculated point spread for the home team
 */
function calculateHomeSpread(homePowerIndex, awayPowerIndex, sport) {
    return awayPowerIndex - homePowerIndex - CONFIG[sport].homeCourtAdvantage;
}

/**
 * Calculates the expected total points for a game based on offensive and defensive power indices
 * @param {number} TotalOffensePowerIndex - The combined offensive power rating
 * @param {number} totalDefensePowerIndex - The combined defensive power rating
 * @param {string} sport - The sport to calculate the total points for
 * @returns {number} The projected total points for the game
 */
function calculateTotalPoints(TotalOffensePowerIndex, totalDefensePowerIndex, sport) {
    return CONFIG[sport].averageTotalPoints + TotalOffensePowerIndex - totalDefensePowerIndex;
}

/**
 * Calculates the predicted points for the away team based on total points and spread
 * @param {number} totalPoints - The total predicted points for both teams combined
 * @param {number} spread - The point spread for the team you want to calculate the points for
 * @returns {number} The predicted points for the away team
 */
function calculateTeamPoints(totalPoints, spread) {
    return (totalPoints - spread) / 2;
}

/**
 * Calculates the probability of a home team winning based on points scored and sport type.
 * Uses the Pythagorean expectation formula to estimate win probability.
 *
 * @param {number} teamPoints - Total points scored by this team
 * @param {number} oppPoints - Total points scored by the opposing team
 * @param {string} sport - Type of sport to calculate probability for
 * @returns {number} Probability of home team winning (between 0 and 1)
 * @throws {Error} When sport is not found in CONFIG.pythagorean_exponent
 */
function calculateWinProbability(teamPoints, oppPoints, sport) {
    const teamFactor = Math.pow(teamPoints, CONFIG[sport].pythagorean_exponent);
    const oppFactor = Math.pow(oppPoints, CONFIG[sport].pythagorean_exponent);
    return teamFactor / (teamFactor + oppFactor);
}

function calculateOdds(winProbability) {
    if (winProbability < 0.5) {
        return (100 * (1 - winProbability)) / winProbability;
    } else {
        return (-100 * winProbability) / (1 - winProbability);
    }
}

/**
 * Calculates various game metrics based on team power indices.
 * @param {number} homeOffensePowerIndex - The home team's offensive power index
 * @param {number} homeDefensePowerIndex - The home team's defensive power index
 * @param {number} awayOffensePowerIndex - The away team's offensive power index
 * @param {number} awayDefensePowerIndex - The away team's defensive power index
 * @param {string} sport - The type of sport being analyzed
 * @returns {Object} An object containing game metrics for both home and away teams:
 */
export function calculateGameMetrics(
    homeOffensePowerIndex,
    homeDefensePowerIndex,
    awayOffensePowerIndex,
    awayDefensePowerIndex,
    sport
) {
    const homePowerIndex = homeOffensePowerIndex + homeDefensePowerIndex;
    const awayPowerIndex = awayOffensePowerIndex + awayDefensePowerIndex;

    const homeSpread = calculateHomeSpread(homePowerIndex, awayPowerIndex, sport);

    const totalPoints = calculateTotalPoints(
        homeOffensePowerIndex + awayOffensePowerIndex,
        homeDefensePowerIndex + awayDefensePowerIndex,
        sport
    );
    const homePoints = calculateTeamPoints(totalPoints, homeSpread);
    const awayPoints = totalPoints - homePoints;

    const homeWinProbability = calculateWinProbability(homePoints, awayPoints, sport);
    const awayWinProbability = 1 - homeWinProbability;

    const homeOdds = calculateOdds(homeWinProbability);
    const awayOdds = calculateOdds(awayWinProbability);

    return {
        home: {
            spread: homeSpread,
            points: homePoints,
            probability: homeWinProbability,
            odds: homeOdds,
        },
        away: {
            spread: -homeSpread,
            points: awayPoints,
            probability: awayWinProbability,
            odds: awayOdds,
        },
    };
}
