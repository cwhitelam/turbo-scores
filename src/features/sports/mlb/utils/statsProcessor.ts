import { PlayerStat } from '../../../../types/stats';

// Organize stats by category
interface StatLeaders {
    batting: {
        avg: PlayerStat[];
        hr: PlayerStat[];
        rbi: PlayerStat[];
        hits: PlayerStat[];
    };
    pitching: {
        strikeouts: PlayerStat[];
        era: PlayerStat[];
    };
    teams: {
        score: PlayerStat[];
        hits: PlayerStat[];
    };
}

// For collecting complete player stat lines
interface BatterStats {
    name: string;
    team: string;
    atBats: number;
    hits: number;
    homeRuns: number;
    rbis: number;
    walks: number;
    runs: number;
    avg: string;
}

interface PitcherStats {
    name: string;
    team: string;
    inningsPitched: string;
    strikeouts: number;
    era: string;
}

// Add a type definition for the stat labels
interface StatLabels {
    batting: string[];
    pitching: string[];
}

/**
 * Extract featured pitchers from the game data.
 * This function always returns the starting pitcher, losing pitcher,
 * and winning relief pitcher(s) if available.
 *
 * @param data - The complete game data from ESPN API.
 * @returns An array of PlayerStat objects for featured pitchers.
 */
function extractFeaturedPitchers(data: any): PlayerStat[] {
    const featuredStats: PlayerStat[] = [];

    console.log('⚾ Extracting featured pitchers data');

    // Debug the structure of the data to ensure we're accessing the right paths
    if (data?.boxscore) {
        console.log('⚾ Boxscore available, keys:', Object.keys(data.boxscore));
    }

    // Check for pitchingDecisions in various locations
    const decisions = data?.boxscore?.pitchingDecisions || data?.pitchingDecisions;

    if (!decisions) {
        console.log('⚾ No pitching decisions found in the data');
        return featuredStats;
    }

    console.log('⚾ Pitching decisions found, keys:', Object.keys(decisions));

    // Helper function to calculate ERA from game stats
    const calculateGameEra = (stats: any): string => {
        if (!stats) return '0.00';

        const ip = parseFloat(stats.inningsPitched || '0');
        const er = parseInt(stats.earnedRuns || '0', 10);

        if (ip > 0 && er >= 0) {
            const gameEra = (er / ip) * 9;
            return gameEra.toFixed(2);
        }
        return '0.00';
    };

    // Starting pitcher
    if (decisions.startingPitcher) {
        const sp = decisions.startingPitcher;
        console.log(`⚾ Starting pitcher: ${sp.athlete?.shortName || 'Unknown'}, stats:`, sp.stats);

        // Calculate game ERA
        const gameEra = calculateGameEra(sp.stats);
        console.log(`⚾ Calculated game ERA for starting pitcher: ${gameEra}`);

        featuredStats.push({
            name: sp.athlete.shortName || sp.athlete.displayName || 'Unknown',
            team: sp.team?.abbreviation || '',
            statType: 'PITCHING',
            value: sp.stats && sp.stats.strikeouts ? parseInt(sp.stats.strikeouts, 10) : 0,
            displayValue: `${sp.stats?.inningsPitched || '0.0'} IP, ${sp.stats?.strikeouts || '0'} K, ${gameEra} ERA`
        });
    }

    // Losing pitcher
    if (decisions.losingPitcher) {
        const lp = decisions.losingPitcher;
        const gameEra = calculateGameEra(lp.stats);
        console.log(`⚾ Calculated game ERA for losing pitcher: ${gameEra}`);

        featuredStats.push({
            name: lp.athlete.shortName || lp.athlete.displayName || 'Unknown',
            team: lp.team?.abbreviation || '',
            statType: 'PITCHING',
            value: 0,
            displayValue: `${lp.stats?.inningsPitched || '0.0'} IP, ${lp.stats?.strikeouts || '0'} K, ${gameEra} ERA`
        });
    }

    // Winning relief pitchers (could be multiple)
    if (decisions.winningRelievers && Array.isArray(decisions.winningRelievers)) {
        decisions.winningRelievers.forEach((wr: any) => {
            const gameEra = calculateGameEra(wr.stats);
            console.log(`⚾ Calculated game ERA for winning reliever: ${gameEra}`);

            featuredStats.push({
                name: wr.athlete.shortName || wr.athlete.displayName || 'Unknown',
                team: wr.team?.abbreviation || '',
                statType: 'PITCHING',
                value: wr.stats && wr.stats.strikeouts ? parseInt(wr.stats.strikeouts, 10) : 0,
                displayValue: `${wr.stats?.inningsPitched || '0.0'} IP, ${wr.stats?.strikeouts || '0'} K, ${gameEra} ERA`
            });
        });
    }

    console.log(`⚾ Extracted ${featuredStats.length} featured pitchers`);
    return featuredStats;
}

// Add debug utility to help validate stat extraction
function debugStatsArray(position: string, stats: any) {
    if (!stats || !Array.isArray(stats)) {
        console.log(`⚾ No valid stats array at position ${position}`);
        return;
    }

    console.log(`⚾ Debug stats at position ${position}:`);
    stats.forEach((stat, index) => {
        console.log(`  [${index}]: ${JSON.stringify(stat)}`);
    });
}

// Add a debugging function to verify box score before processing
function logBoxscoreAthletes(data: any) {
    if (!data?.boxscore?.players) {
        console.log('⚾ No boxscore.players found');
        return;
    }

    console.log('⚾ DEBUGGING BOXSCORE ATHLETES:');
    data.boxscore.players.forEach((team: any, teamIndex: number) => {
        const teamName = team.team?.abbreviation || `Team${teamIndex}`;
        console.log(`⚾ Team: ${teamName}`);

        if (team.statistics?.[0]?.athletes) {
            console.log(`⚾ Batters for ${teamName}:`);
            team.statistics[0].athletes.forEach((player: any) => {
                if (player.athlete && player.stats) {
                    const name = player.athlete.shortName || player.athlete.displayName;
                    if (player.stats.length >= 5) {
                        console.log(`⚾ ${name}: [0]=${player.stats[0]} (AB), [1]=${player.stats[1]} (R), [2]=${player.stats[2]} (BB/HR), [3]=${player.stats[3]} (RBI/Other), [4]=${player.stats[4]} (RBI/Other)`);
                    } else {
                        console.log(`⚾ ${name}: stats too short, length=${player.stats.length}`);
                    }
                }
            });
        }
    });
}

// Add a function to verify home runs by checking the actual plays data
function verifyHomeRuns(data: any): Map<string, number> {
    const verifiedHRs = new Map<string, number>();

    console.log('⚾ Verifying home runs from play-by-play data');

    // Check if plays data exists
    if (!data?.plays) {
        console.log('⚾ No plays data available for HR verification');
        return verifiedHRs;
    }

    try {
        // Filter plays to only include home runs
        const hrPlays = data.plays.filter((play: any) => {
            return play.type?.text?.toLowerCase().includes('home run');
        });

        console.log(`⚾ Found ${hrPlays.length} home run plays in the data`);

        // Process each home run play to get the batter
        hrPlays.forEach((play: any) => {
            if (play.participants) {
                const batter = play.participants.find((p: any) => p.type === 'batter');
                if (batter && batter.athlete) {
                    const playerName = batter.athlete.shortName || batter.athlete.displayName;
                    const playerId = batter.athlete.id;

                    // Increment HR count for this player
                    const currentHRs = verifiedHRs.get(playerId) || 0;
                    verifiedHRs.set(playerId, currentHRs + 1);

                    console.log(`⚾ VERIFIED: ${playerName} (ID: ${playerId}) hit a home run`);
                }
            }
        });
    } catch (error) {
        console.error('❌ Error verifying home runs:', error);
    }

    return verifiedHRs;
}

// Replace the existing getStatsSchema function with a more robust approach
function getStatPositions(data: any): { batting: Record<string, number>, pitching: Record<string, number> } {
    // Default positions as fallback
    const positions = {
        batting: {
            AB: -1,
            H: -1,
            R: -1,
            HR: -1,
            RBI: -1,
            BB: -1
        },
        pitching: {
            IP: -1,
            H: -1,
            ER: -1,
            SO: -1,
            BB: -1
        }
    };

    try {
        // First, log the entire statistics structure to see what we're working with
        console.log('⚾ Examining API data structure...');

        if (data?.boxscore?.players) {
            for (let teamIndex = 0; teamIndex < data.boxscore.players.length; teamIndex++) {
                const team = data.boxscore.players[teamIndex];
                const teamName = team.team?.abbreviation || `Team${teamIndex}`;

                if (team.statistics && team.statistics.length > 0) {
                    // Log team statistics structure
                    console.log(`⚾ Found statistics for team ${teamName}: ${team.statistics.length} categories`);

                    // Find batting stats (typically index 0)
                    if (team.statistics[0] && team.statistics[0].labels) {
                        const battingLabels = team.statistics[0].labels;
                        console.log(`⚾ Found batting labels for ${teamName}: ${JSON.stringify(battingLabels)}`);

                        // Map each label to its position
                        battingLabels.forEach((label: string, index: number) => {
                            if (label === 'AB') positions.batting.AB = index;
                            else if (label.includes('AB')) positions.batting.AB = index;
                            else if (label === 'H') positions.batting.H = index;
                            else if (label === 'R') positions.batting.R = index;
                            else if (label === 'HR') positions.batting.HR = index;
                            else if (label === 'RBI') positions.batting.RBI = index;
                            else if (label === 'BB') positions.batting.BB = index;
                        });

                        console.log(`⚾ Mapped batting positions: ${JSON.stringify(positions.batting)}`);
                    }

                    // Find pitching stats (typically index 1)
                    if (team.statistics[1] && team.statistics[1].labels) {
                        const pitchingLabels = team.statistics[1].labels;
                        console.log(`⚾ Found pitching labels for ${teamName}: ${JSON.stringify(pitchingLabels)}`);

                        // Map each label to its position
                        pitchingLabels.forEach((label: string, index: number) => {
                            if (label === 'IP') positions.pitching.IP = index;
                            else if (label === 'H') positions.pitching.H = index;
                            else if (label === 'ER') positions.pitching.ER = index;
                            else if (label === 'K' || label === 'SO') positions.pitching.SO = index;
                            else if (label === 'BB') positions.pitching.BB = index;
                        });

                        console.log(`⚾ Mapped pitching positions: ${JSON.stringify(positions.pitching)}`);
                    }

                    // Once we have valid mappings, we can stop processing
                    if (positions.batting.AB !== -1 && positions.pitching.IP !== -1) {
                        break;
                    }
                }
            }
        }

        // Verify that we have reasonable mappings
        let hasMappingIssues = false;

        if (positions.batting.AB === -1) {
            console.warn('⚾ WARNING: Could not find AB position in batting stats!');
            positions.batting.AB = 0; // Fall back to position 0
            hasMappingIssues = true;
        }

        if (positions.batting.HR === -1) {
            console.warn('⚾ WARNING: Could not find HR position in batting stats!');
            positions.batting.HR = 2; // Fall back to position 2
            hasMappingIssues = true;
        }

        if (positions.batting.RBI === -1) {
            console.warn('⚾ WARNING: Could not find RBI position in batting stats!');
            positions.batting.RBI = 4; // Fall back to position 4
            hasMappingIssues = true;
        }

        if (positions.pitching.IP === -1) {
            console.warn('⚾ WARNING: Could not find IP position in pitching stats!');
            positions.pitching.IP = 0; // Fall back to position 0
            hasMappingIssues = true;
        }

        if (positions.pitching.ER === -1) {
            console.warn('⚾ WARNING: Could not find ER position in pitching stats!');
            positions.pitching.ER = 3; // Fall back to position 3
            hasMappingIssues = true;
        }

        if (hasMappingIssues) {
            console.warn('⚾ Using fallback positions for some stats. Results may be incorrect!');
        }

    } catch (error) {
        console.error('❌ Error determining stat positions:', error);
    }

    return positions;
}

// Update the batter stats extraction logic to use the new positions
function extractBatterStats(player: any, positions: Record<string, number>, teamAbbr: string): BatterStats {
    const playerName = player.athlete.shortName || player.athlete.displayName || 'Unknown';

    // Initialize with default values
    const stats: BatterStats = {
        name: playerName,
        team: teamAbbr,
        atBats: 0,
        hits: 0,
        homeRuns: 0,
        rbis: 0,
        walks: 0,
        runs: 0,
        avg: '.000'
    };

    try {
        // Log the player's raw stats for debugging
        console.log(`⚾ Raw stats for ${playerName}:`, player.stats);

        // Extract at-bats and hits - look for h-ab format or separate fields
        if (positions.AB !== -1) {
            const abValue = player.stats[positions.AB];
            if (abValue) {
                // Handle format like "1-4"
                if (abValue.includes('-')) {
                    const parts = abValue.split('-').map((n: string) => parseInt(n, 10));
                    stats.hits = parts[0] || 0;
                    stats.atBats = parts[1] || 0;
                    console.log(`⚾ Extracted ${stats.hits}-${stats.atBats} for ${playerName} from position ${positions.AB} (formatted)`);
                }
                // Handle numeric value (just AB)
                else if (!isNaN(parseInt(abValue, 10))) {
                    stats.atBats = parseInt(abValue, 10);
                    console.log(`⚾ Extracted AB=${stats.atBats} for ${playerName} from position ${positions.AB} (numeric)`);

                    // If we have a separate H position, use that for hits
                    if (positions.H !== -1 && player.stats[positions.H] && !isNaN(parseInt(player.stats[positions.H], 10))) {
                        stats.hits = parseInt(player.stats[positions.H], 10);
                        console.log(`⚾ Extracted H=${stats.hits} for ${playerName} from position ${positions.H} (separate)`);
                    }
                }
            }
        }

        // Extract home runs
        if (positions.HR !== -1 && player.stats[positions.HR]) {
            stats.homeRuns = parseInt(player.stats[positions.HR], 10) || 0;
            console.log(`⚾ Extracted ${stats.homeRuns} HR for ${playerName} from position ${positions.HR}`);
        }

        // Extract RBIs
        if (positions.RBI !== -1 && player.stats[positions.RBI]) {
            stats.rbis = parseInt(player.stats[positions.RBI], 10) || 0;
            console.log(`⚾ Extracted ${stats.rbis} RBI for ${playerName} from position ${positions.RBI}`);
        }

        // Extract runs
        if (positions.R !== -1 && player.stats[positions.R]) {
            stats.runs = parseInt(player.stats[positions.R], 10) || 0;
            console.log(`⚾ Extracted ${stats.runs} R for ${playerName} from position ${positions.R}`);
        }

        // Extract walks
        if (positions.BB !== -1 && player.stats[positions.BB]) {
            stats.walks = parseInt(player.stats[positions.BB], 10) || 0;
            console.log(`⚾ Extracted ${stats.walks} BB for ${playerName} from position ${positions.BB}`);
        }

    } catch (error) {
        console.error(`❌ Error extracting stats for ${playerName}:`, error);
    }

    return stats;
}

// Update the pitcher stats extraction logic to use the new positions
function extractPitcherStats(pitcher: any, positions: Record<string, number>, teamAbbr: string): PitcherStats {
    const pitcherName = pitcher.athlete.shortName || pitcher.athlete.displayName || 'Unknown';

    // Initialize with default values
    const stats: PitcherStats = {
        name: pitcherName,
        team: teamAbbr,
        inningsPitched: '0.0',
        strikeouts: 0,
        era: '0.00'
    };

    try {
        // Log the pitcher's raw stats for debugging
        console.log(`⚾ Raw pitching stats for ${pitcherName}:`, pitcher.stats);

        // Extract innings pitched
        if (positions.IP !== -1 && pitcher.stats[positions.IP]) {
            stats.inningsPitched = pitcher.stats[positions.IP];
            console.log(`⚾ Extracted ${stats.inningsPitched} IP for ${pitcherName} from position ${positions.IP}`);
        }

        // Extract strikeouts
        if (positions.SO !== -1 && pitcher.stats[positions.SO]) {
            stats.strikeouts = parseInt(pitcher.stats[positions.SO], 10) || 0;
            console.log(`⚾ Extracted ${stats.strikeouts} K for ${pitcherName} from position ${positions.SO}`);
        }

        // Calculate ERA from innings pitched and earned runs
        if (positions.ER !== -1 && pitcher.stats[positions.ER] && parseFloat(stats.inningsPitched) > 0) {
            const earnedRuns = parseInt(pitcher.stats[positions.ER], 10) || 0;
            const ip = parseFloat(stats.inningsPitched);
            const gameEra = (earnedRuns / ip) * 9;
            stats.era = gameEra.toFixed(2);
            console.log(`⚾ Calculated ${stats.era} ERA for ${pitcherName} (${earnedRuns} ER in ${ip} IP)`);
        }

    } catch (error) {
        console.error(`❌ Error extracting pitching stats for ${pitcherName}:`, error);
    }

    return stats;
}

/**
 * Process MLB game data to extract player stats for display in the ticker.
 *
 * @param data - The MLB game data from ESPN API.
 * @returns Array of formatted player stats.
 */
export function processMLBStats(data: any): PlayerStat[] {
    console.log('⚾ Processing MLB data');

    // Get the positions of stats in the API response
    const positions = getStatPositions(data);
    console.log('⚾ Using stat positions:', JSON.stringify(positions));

    // Verify home runs if needed
    const verifiedHRs = verifyHomeRuns(data);

    // Container for all stats that will ultimately be shown
    const allStats: PlayerStat[] = [];

    // Maps to collect complete stat lines for batters and pitchers
    const batterStatsMap = new Map<string, BatterStats>();
    const pitcherStatsMap = new Map<string, PitcherStats>();

    // Leaders container organized by category
    const leaders: StatLeaders = {
        batting: { avg: [], hr: [], rbi: [], hits: [] },
        pitching: { strikeouts: [], era: [] },
        teams: { score: [], hits: [] }
    };

    try {
        // Primary branch: Process boxscore data if available
        if (data?.boxscore?.players?.length > 0) {
            console.log('⚾ Found boxscore data with players');

            data.boxscore.players.forEach((team: any, teamIndex: number) => {
                const teamAbbr = team.team?.abbreviation || `Team${teamIndex}`;
                console.log(`⚾ Processing team ${teamAbbr}`);

                // Process batter stats (statistics index 0)
                if (team.statistics?.[0]?.athletes) {
                    team.statistics[0].athletes.forEach((player: any) => {
                        if (!player.athlete || !player.stats) return;

                        const playerName = player.athlete.shortName || player.athlete.displayName || 'Unknown';
                        const playerKey = `${playerName}-${teamAbbr}`;

                        if (!batterStatsMap.has(playerKey)) {
                            // Extract stats using our new function
                            const stats = extractBatterStats(player, positions.batting, teamAbbr);

                            // Apply verified HR data if available
                            if (verifiedHRs.size > 0 && player.athlete.id) {
                                const verifiedHRCount = verifiedHRs.get(player.athlete.id) || 0;
                                if (stats.homeRuns !== verifiedHRCount) {
                                    console.log(`⚾ Overriding HR count for ${playerName}: API=${stats.homeRuns}, Verified=${verifiedHRCount}`);
                                    stats.homeRuns = verifiedHRCount;
                                }
                            }

                            // Only add if meaningful stats exist
                            if (stats.hits > 0 || stats.homeRuns > 0 || stats.rbis > 0 || stats.walks > 0 || stats.runs > 0) {
                                batterStatsMap.set(playerKey, stats);
                            }
                        }
                    });
                }

                // Process pitcher stats (statistics index 1)
                if (team.statistics?.[1]?.athletes) {
                    team.statistics[1].athletes.forEach((pitcher: any) => {
                        if (!pitcher.athlete || !pitcher.stats) return;

                        const pitcherName = pitcher.athlete.shortName || pitcher.athlete.displayName || 'Unknown';
                        const pitcherKey = `${pitcherName}-${teamAbbr}`;

                        if (!pitcherStatsMap.has(pitcherKey)) {
                            // Extract stats using our new function
                            const stats = extractPitcherStats(pitcher, positions.pitching, teamAbbr);

                            // Only include if the pitcher recorded at least one inning
                            if (parseFloat(stats.inningsPitched) > 0) {
                                pitcherStatsMap.set(pitcherKey, stats);
                            }
                        }
                    });
                }

                // Add team stats (e.g., team score)
                if (team.team && team.score !== undefined) {
                    const score = parseInt(team.score, 10);
                    if (score > 0) {
                        const teamStat: PlayerStat = {
                            name: teamAbbr,
                            team: teamAbbr,
                            statType: 'TEAM',
                            value: score,
                            displayValue: `${score} RUNS`
                        };
                        allStats.push(teamStat);
                        leaders.teams.score.push(teamStat);
                    }
                }
            });

            // Process batter stats from the batterStatsMap and convert to a display format
            batterStatsMap.forEach((stats) => {
                if (stats.hits > 0 || stats.homeRuns > 0 || stats.rbis > 0 || stats.walks > 0 || stats.runs > 0) {
                    // Log this check to see if any data is being lost
                    console.log(`⚾ Batter ${stats.name} preparing display - H/AB: ${stats.hits}-${stats.atBats}, HR: ${stats.homeRuns}, RBI: ${stats.rbis}, BB: ${stats.walks}, R: ${stats.runs}`);

                    // Build the display string
                    const statLabels: string[] = [];

                    // Always show H-AB if atBats > 0
                    if (stats.atBats > 0) {
                        statLabels.push(`${stats.hits}-${stats.atBats}`);
                        console.log(`⚾ Added H-AB format for ${stats.name}: ${stats.hits}-${stats.atBats}`);
                    }

                    // Add other stats in order
                    if (stats.homeRuns > 0) {
                        statLabels.push(`${stats.homeRuns} HR`);
                        console.log(`⚾ Added HR for ${stats.name}: ${stats.homeRuns} HR`);
                    }

                    if (stats.rbis > 0) {
                        statLabels.push(`${stats.rbis} RBI`);
                        console.log(`⚾ Added RBI for ${stats.name}: ${stats.rbis} RBI`);
                    }

                    if (stats.walks > 0) {
                        statLabels.push(`${stats.walks} BB`);
                        console.log(`⚾ Added BB for ${stats.name}: ${stats.walks} BB`);
                    }

                    if (stats.runs > 0) {
                        statLabels.push(`${stats.runs} R`);
                        console.log(`⚾ Added R for ${stats.name}: ${stats.runs} R`);
                    }

                    // Join with commas
                    const displayValue = statLabels.join(", ");
                    console.log(`⚾ Final display for ${stats.name}: ${displayValue}`);

                    // Determine a value to rank performances
                    let value = 0;
                    if (stats.homeRuns >= 2) {
                        value = stats.homeRuns * 150;
                    } else if (stats.homeRuns > 0) {
                        value = stats.homeRuns * 100;
                    }
                    if (stats.rbis >= 4) {
                        value += stats.rbis * 20;
                    } else if (stats.rbis > 0) {
                        value += stats.rbis * 10;
                    }
                    if (stats.hits >= 3) {
                        value += stats.hits * 8;
                    } else if (stats.hits > 0) {
                        value += stats.hits * 5;
                    }
                    if (stats.walks >= 2) {
                        value += stats.walks * 3;
                    } else if (stats.walks > 0) {
                        value += stats.walks * 2;
                    }
                    if (stats.runs >= 2) {
                        value += stats.runs * 4;
                    } else if (stats.runs > 0) {
                        value += stats.runs * 2;
                    }

                    const batterStat: PlayerStat = {
                        name: stats.name,
                        team: stats.team,
                        statType: 'BATTING',
                        value: value,
                        displayValue: displayValue
                    };
                    allStats.push(batterStat);

                    // Categorize for leader boards
                    if (stats.homeRuns > 0) {
                        leaders.batting.hr.push(batterStat);
                    } else if (stats.rbis > 0) {
                        leaders.batting.rbi.push(batterStat);
                    } else if (stats.hits > 0) {
                        leaders.batting.hits.push(batterStat);
                    }
                }
            });

            // Process pitcher stats from the pitcherStatsMap and convert to display format
            pitcherStatsMap.forEach((stats) => {
                if (parseFloat(stats.inningsPitched) >= 1.0) {
                    const statLabels: string[] = [];
                    statLabels.push(`${stats.inningsPitched} IP`);
                    if (stats.strikeouts > 0) statLabels.push(`${stats.strikeouts} K`);
                    statLabels.push(`${stats.era} ERA`);
                    const displayValue = statLabels.join(", ");

                    console.log(`⚾ Pitcher display value for ${stats.name}: ${displayValue}`);

                    let value = 0;
                    const innings = parseFloat(stats.inningsPitched);
                    if (innings >= 8.0) {
                        value += innings * 15;
                    } else if (innings >= 6.0) {
                        value += innings * 10;
                    } else {
                        value += innings * 5;
                    }
                    if (stats.strikeouts >= 10) {
                        value += stats.strikeouts * 3;
                    } else if (stats.strikeouts >= 7) {
                        value += stats.strikeouts * 2;
                    } else {
                        value += stats.strikeouts;
                    }

                    const eraNum = parseFloat(stats.era);
                    if (eraNum < 1.0 && innings >= 5.0) {
                        value += 50;
                    } else if (eraNum < 3.0 && innings >= 5.0) {
                        value += 20;
                    }

                    const pitcherStat: PlayerStat = {
                        name: stats.name,
                        team: stats.team,
                        statType: 'PITCHING',
                        value: value,
                        displayValue: displayValue
                    };
                    allStats.push(pitcherStat);
                    leaders.pitching.strikeouts.push(pitcherStat);
                }
            });

            // --- New Section: Include Featured Pitchers ---
            const featuredPitchers = extractFeaturedPitchers(data);
            if (featuredPitchers.length) {
                console.log('⚾ Including featured pitchers in the final stats');
                allStats.push(...featuredPitchers);
            }

            // Build a ticker-friendly ordered list of the top stats (leaders)
            const orderedStats: PlayerStat[] = [];
            const addTopPerformers = (category: PlayerStat[], count: number = 3) => {
                // For ERA the lower value is better; otherwise sort descending.
                const sorted = [...category].sort((a, b) =>
                    a.statType === 'ERA' ? a.value - b.value : b.value - a.value
                );
                orderedStats.push(...sorted.slice(0, count));
            };

            // Order team scores first, then batters and pitchers.
            addTopPerformers(leaders.teams.score, leaders.teams.score.length);
            if (leaders.batting.hr.length > 0) addTopPerformers(leaders.batting.hr);
            if (leaders.batting.rbi.length > 0) addTopPerformers(leaders.batting.rbi);
            if (leaders.batting.hits.length > 0) addTopPerformers(leaders.batting.hits);
            if (leaders.pitching.strikeouts.length > 0) addTopPerformers(leaders.pitching.strikeouts);

            // Remove duplicates – using a key that includes statType so each category remains distinct.
            const uniqueStats: PlayerStat[] = [];
            const seen = new Set<string>();
            orderedStats.forEach(stat => {
                const key = `${stat.name}-${stat.team}-${stat.statType}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueStats.push(stat);
                }
            });

            console.log(`⚾ Final MLB stats for ticker: ${uniqueStats.length}`);
            return uniqueStats;
        } else {
            // Fallback branch: Use competitors data if boxscore is not available
            console.log('⚾ No boxscore data found, using competitors data');
            const competitors = data?.header?.competitions?.[0]?.competitors || [];
            competitors.forEach((team: any) => {
                const teamAbbr = team.team?.abbreviation || '';
                console.log(`⚾ Processing team ${teamAbbr} fallback stats`);

                // Add team score
                const score = parseInt(team.score || '0', 10);
                if (score > 0) {
                    const teamStat: PlayerStat = {
                        name: teamAbbr,
                        team: teamAbbr,
                        statType: 'TEAM',
                        value: score,
                        displayValue: `${score} RUNS`
                    };
                    allStats.push(teamStat);
                    leaders.teams.score.push(teamStat);
                }

                // Process probable pitcher stats if available
                if (team.probables && team.probables.length > 0) {
                    const probablePitcher = team.probables[0];
                    const pitcher = probablePitcher.athlete;
                    if (pitcher) {
                        const pitcherName = pitcher.shortName || pitcher.displayName || 'Unknown';
                        // Rename inner stats to avoid shadowing the pitcherStatsMap variable
                        const pitcherCategoryStats = probablePitcher.statistics?.splits?.categories || [];

                        const fullInnings = pitcherCategoryStats.find((s: any) => s.name === 'fullInnings');
                        const partInnings = pitcherCategoryStats.find((s: any) => s.name === 'partInnings');
                        const strikeoutsStat = pitcherCategoryStats.find((s: any) => s.name === 'strikeouts');
                        const eraStat = pitcherCategoryStats.find((s: any) => s.name === 'ERA');

                        if (fullInnings && partInnings) {
                            const ip = `${fullInnings.displayValue}.${partInnings.displayValue}`;
                            const kValue = strikeoutsStat ? parseInt(strikeoutsStat.displayValue, 10) : 0;
                            const eraValue = eraStat?.displayValue || '0.00';

                            const statLabels = [`${ip} IP`];
                            if (kValue > 0) statLabels.push(`${kValue} K`);
                            if (parseFloat(eraValue) > 0) statLabels.push(`${eraValue} ERA`);

                            const pitcherStat: PlayerStat = {
                                name: pitcherName,
                                team: teamAbbr,
                                statType: 'PITCHING',
                                value: kValue,
                                displayValue: statLabels.join(", ")
                            };

                            allStats.push(pitcherStat);
                            leaders.pitching.strikeouts.push(pitcherStat);
                        }
                    }
                }
            });
        }

        // Build a ticker-friendly ordered list of the top stats (leaders)
        const orderedStats: PlayerStat[] = [];
        const addTopPerformers = (category: PlayerStat[], count: number = 3) => {
            // For ERA the lower value is better; otherwise sort descending.
            const sorted = [...category].sort((a, b) =>
                a.statType === 'ERA' ? a.value - b.value : b.value - a.value
            );
            orderedStats.push(...sorted.slice(0, count));
        };

        // Order team scores first, then batters and pitchers.
        addTopPerformers(leaders.teams.score, leaders.teams.score.length);
        if (leaders.batting.hr.length > 0) addTopPerformers(leaders.batting.hr);
        if (leaders.batting.rbi.length > 0) addTopPerformers(leaders.batting.rbi);
        if (leaders.batting.hits.length > 0) addTopPerformers(leaders.batting.hits);
        if (leaders.pitching.strikeouts.length > 0) addTopPerformers(leaders.pitching.strikeouts);

        // Remove duplicates – using a key that includes statType so each category remains distinct.
        const uniqueStats: PlayerStat[] = [];
        const seen = new Set<string>();
        orderedStats.forEach(stat => {
            const key = `${stat.name}-${stat.team}-${stat.statType}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueStats.push(stat);
            }
        });

        console.log(`⚾ Final MLB stats for ticker: ${uniqueStats.length}`);
        return uniqueStats;
    } catch (error) {
        console.error('❌ Error processing MLB stats:', error);
        return [];
    }
}

/**
 * Extract key stats from a displayValue string.
 * For example: "2-4, HR, 4 RBI, 2 R, SB" returns "HR, 4 RBI"
 *
 * @param displayValue - The full display string containing multiple stats.
 * @param statType - The specific stat type to extract (e.g., "HR", "K").
 * @returns A string with the extracted stats or null if none found.
 */
function extractStats(displayValue: string, statType: string): string | null {
    if (!displayValue) return null;
    try {
        const parts = displayValue.split(',').map(p => p.trim());
        const relevantParts = parts.filter(part => {
            // Skip at-bat info formatted like "2-4"
            if (/^\d+-\d+$/.test(part)) return false;
            // Check for the requested stat type
            if (statType === 'HR' && part.includes('HR')) return true;
            if (statType === 'K' && part.includes('K')) return true;
            if (part.includes('RBI')) return true;
            return false;
        });
        return relevantParts.length > 0 ? relevantParts.join(', ') : null;
    } catch {
        return null;
    }
}