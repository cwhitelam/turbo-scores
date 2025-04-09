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
    avg: string;
}

interface PitcherStats {
    name: string;
    team: string;
    inningsPitched: string;
    strikeouts: number;
    era: string;
}

/**
 * Process MLB game data to extract player stats for display in the ticker
 * 
 * @param data - The MLB game data from ESPN API
 * @returns Array of formatted player stats
 */
export function processMLBStats(data: any): PlayerStat[] {
    // Create a container for all our stats
    const allStats: PlayerStat[] = [];

    // Create containers for complete player stat lines
    const batterStats = new Map<string, BatterStats>();
    const pitcherStats = new Map<string, PitcherStats>();

    // Create a container to organize leaders by category
    const leaders: StatLeaders = {
        batting: {
            avg: [],
            hr: [],
            rbi: [],
            hits: []
        },
        pitching: {
            strikeouts: [],
            era: []
        },
        teams: {
            score: [],
            hits: []
        }
    };

    try {
        console.log('⚾ Processing MLB data');

        // Process boxscore data if available
        if (data?.boxscore?.players?.length > 0) {
            console.log('⚾ Found boxscore data with players');

            data.boxscore.players.forEach((team: any, teamIndex: number) => {
                console.log(`⚾ Processing team ${team?.team?.abbreviation || `Team ${teamIndex}`}`);
                const teamAbbr = team.team?.abbreviation || '';

                // Process players data directly
                if (team.statistics?.[0]?.athletes) {
                    const players = team.statistics[0].athletes;
                    console.log(`⚾ Found ${players.length} players with stats`);

                    players.forEach((player: any) => {
                        if (!player.athlete || !player.stats) return;

                        const playerName = player.athlete.shortName || player.athlete.displayName || 'Unknown';
                        const playerKey = `${playerName}-${teamAbbr}`;

                        // Collect complete batter stats
                        if (!batterStats.has(playerKey)) {
                            // Create default stats
                            const stats: BatterStats = {
                                name: playerName,
                                team: teamAbbr,
                                atBats: 0,
                                hits: 0,
                                homeRuns: 0,
                                rbis: 0,
                                avg: '.000'
                            };

                            // Stats format: "2-3", "3", "1", "2", "2", "1", "0", "0", "13", ".355", ".447", ".516"

                            // Get at-bat line (position 0) "2-3" format
                            if (player.stats.length > 0 && player.stats[0]?.includes('-')) {
                                const [hits, atBats] = player.stats[0].split('-').map((n: string) => parseInt(n));
                                stats.hits = hits || 0;
                                stats.atBats = atBats || 0;
                            }

                            // Get home runs (position 2)
                            if (player.stats.length > 2 && !isNaN(parseInt(player.stats[2]))) {
                                stats.homeRuns = parseInt(player.stats[2]);
                            }

                            // Get RBIs (position 4)
                            if (player.stats.length > 4 && !isNaN(parseInt(player.stats[4]))) {
                                stats.rbis = parseInt(player.stats[4]);
                            }

                            // Get batting average (position 9)
                            if (player.stats.length > 9 && player.stats[9]) {
                                stats.avg = player.stats[9];
                            }

                            // Only add if they have significant stats
                            if (stats.hits > 0 || stats.homeRuns > 0 || stats.rbis > 0) {
                                batterStats.set(playerKey, stats);
                            }
                        }
                    });
                }

                // Process pitchers
                if (team.statistics?.[1]?.athletes) {
                    const pitchers = team.statistics[1].athletes;
                    console.log(`⚾ Found ${pitchers.length} pitchers with stats`);

                    pitchers.forEach((pitcher: any) => {
                        if (!pitcher.athlete || !pitcher.stats) return;

                        const pitcherName = pitcher.athlete.shortName || pitcher.athlete.displayName || 'Unknown';
                        const pitcherKey = `${pitcherName}-${teamAbbr}`;

                        // Collect complete pitcher stats
                        if (!pitcherStats.has(pitcherKey)) {
                            // Create default stats
                            const stats: PitcherStats = {
                                name: pitcherName,
                                team: teamAbbr,
                                inningsPitched: '0.0',
                                strikeouts: 0,
                                era: '0.00'
                            };

                            // Stats format varies for pitchers, but typically:
                            // "6.0", "4", "0", "0", "0", "6", "0", "87-58", "3.78", "87" 

                            // Get innings pitched (position 0)
                            if (pitcher.stats.length > 0) {
                                stats.inningsPitched = pitcher.stats[0];
                            }

                            // Get strikeouts (position 5)
                            if (pitcher.stats.length > 5 && !isNaN(parseInt(pitcher.stats[5]))) {
                                stats.strikeouts = parseInt(pitcher.stats[5]);
                            }

                            // Get ERA (position 8)
                            if (pitcher.stats.length > 8 && pitcher.stats[8]) {
                                stats.era = pitcher.stats[8];
                            }

                            // Only add if they pitched
                            if (parseFloat(stats.inningsPitched) > 0) {
                                pitcherStats.set(pitcherKey, stats);
                            }
                        }
                    });
                }

                // Add team stats
                if (team.statistics && team.team) {
                    // Add team score if available
                    const score = parseInt(team.score || '0');
                    if (score > 0) {
                        const stat: PlayerStat = {
                            name: `${teamAbbr}`,
                            team: teamAbbr,
                            statType: 'TEAM',
                            value: score,
                            displayValue: `${score} RUNS`
                        };
                        allStats.push(stat);
                        leaders.teams.score.push(stat);
                    }
                }
            });
        } else {
            // Fallback to competitor-based stats if boxscore not available
            console.log('⚾ No boxscore data found, using competitors data');
            const competitors = data?.header?.competitions?.[0]?.competitors || [];

            for (const team of competitors) {
                const teamAbbr = team?.team?.abbreviation || '';
                console.log(`⚾ Processing team ${teamAbbr} fallback stats`);

                // Add team score
                const score = parseInt(team.score || '0');
                if (score > 0) {
                    const stat: PlayerStat = {
                        name: teamAbbr,
                        team: teamAbbr,
                        statType: 'TEAM',
                        value: score,
                        displayValue: `${score} RUNS`
                    };
                    allStats.push(stat);
                    leaders.teams.score.push(stat);
                }

                // Try to get pitcher stats
                if (team.probables && team.probables.length > 0) {
                    const pitcher = team.probables[0].athlete;
                    if (pitcher) {
                        const pitcherName = pitcher.shortName || pitcher.displayName || 'Unknown';
                        const pitcherKey = `${pitcherName}-${teamAbbr}`;
                        const pitcherStats = team.probables[0].statistics?.splits?.categories || [];

                        // Get innings pitched and strikeouts if available
                        const fullInnings = pitcherStats.find((stat: any) => stat.name === 'fullInnings');
                        const partInnings = pitcherStats.find((stat: any) => stat.name === 'partInnings');
                        const strikeouts = pitcherStats.find((stat: any) => stat.name === 'strikeouts');
                        const era = pitcherStats.find((stat: any) => stat.name === 'ERA');

                        if (fullInnings && partInnings) {
                            const ip = `${fullInnings.displayValue}.${partInnings.displayValue}`;
                            const k = strikeouts?.displayValue || '0';
                            const eraValue = era?.displayValue || '0.00';

                            // Format in NBA style
                            let statLabels = [];
                            statLabels.push(`${ip} IP`);

                            if (parseInt(k) > 0) {
                                statLabels.push(`${k} K`);
                            }

                            if (parseFloat(eraValue) > 0) {
                                statLabels.push(`${eraValue} ERA`);
                            }

                            // Add detailed pitcher stat in NBA style
                            allStats.push({
                                name: pitcherName,
                                team: teamAbbr,
                                statType: 'PITCHING',
                                value: parseInt(k),
                                displayValue: statLabels.join(", ")
                            });
                        }
                    }
                }
            }
        }

        // Convert batter stats to NBA-style display format
        for (const [_, stats] of batterStats) {
            // Only add batters with meaningful stats
            if (stats.hits > 0 || stats.homeRuns > 0 || stats.rbis > 0) {
                // Format using NBA-style display values: "2-4, 1 HR, 3 RBI"
                let displayValue = "";
                let statLabels = [];

                // Add at-bats info if available
                if (stats.atBats > 0) {
                    statLabels.push(`${stats.hits}-${stats.atBats}`);
                }

                // Add home runs if available
                if (stats.homeRuns > 0) {
                    statLabels.push(`${stats.homeRuns} HR`);
                }

                // Add RBIs if available
                if (stats.rbis > 0) {
                    statLabels.push(`${stats.rbis} RBI`);
                }

                // Join all stat labels
                displayValue = statLabels.join(", ");

                // Determine the value to sort by (prioritize home runs > RBIs > hits)
                // Weight them more heavily to ensure standout performances come first
                let value = 0;

                // Multi-homer games are extremely valuable
                if (stats.homeRuns >= 2) {
                    value = stats.homeRuns * 150;
                } else if (stats.homeRuns > 0) {
                    value = stats.homeRuns * 100;
                }

                // High RBI games are also valuable
                if (stats.rbis >= 4) {
                    value += stats.rbis * 20;
                } else if (stats.rbis > 0) {
                    value += stats.rbis * 10;
                }

                // Multi-hit games add value
                if (stats.hits >= 3) {
                    value += stats.hits * 8;
                } else if (stats.hits > 0) {
                    value += stats.hits * 5;
                }

                // Use 'BATTING' as the statType for batters
                const stat: PlayerStat = {
                    name: stats.name,
                    team: stats.team,
                    statType: 'BATTING',
                    value: value,
                    displayValue: displayValue
                };

                allStats.push(stat);

                // Still categorize for sorting purposes
                if (stats.homeRuns > 0) {
                    leaders.batting.hr.push(stat);
                } else if (stats.rbis > 0) {
                    leaders.batting.rbi.push(stat);
                } else if (stats.hits > 0) {
                    leaders.batting.hits.push(stat);
                }
            }
        }

        // Convert pitcher stats to NBA-style display format
        for (const [_, stats] of pitcherStats) {
            // Only add pitchers with significant innings
            if (parseFloat(stats.inningsPitched) >= 1.0) {
                // Format in NBA-style
                let statLabels = [];

                // Add innings pitched
                statLabels.push(`${stats.inningsPitched} IP`);

                // Add strikeouts
                if (stats.strikeouts > 0) {
                    statLabels.push(`${stats.strikeouts} K`);
                }

                // Add ERA
                if (parseFloat(stats.era) > 0) {
                    statLabels.push(`${stats.era} ERA`);
                }

                // Join all stat labels
                const displayValue = statLabels.join(", ");

                // Value is based on innings + strikeouts
                // Weight quality starts and high strikeout games
                let value = 0;
                const innings = parseFloat(stats.inningsPitched);

                // Complete game (8+ innings) is very valuable
                if (innings >= 8.0) {
                    value += innings * 15;
                } else if (innings >= 6.0) {
                    // Quality start (6+ innings)
                    value += innings * 10;
                } else {
                    value += innings * 5;
                }

                // High strikeout games
                if (stats.strikeouts >= 10) {
                    value += stats.strikeouts * 3;
                } else if (stats.strikeouts >= 7) {
                    value += stats.strikeouts * 2;
                } else {
                    value += stats.strikeouts;
                }

                // Bonus for low ERA
                const era = parseFloat(stats.era);
                if (era < 1.0 && innings >= 5.0) {
                    value += 50; // Big bonus for dominant performances
                } else if (era < 3.0 && innings >= 5.0) {
                    value += 20;
                }

                // Use 'PITCHING' as the statType for pitchers
                const stat: PlayerStat = {
                    name: stats.name,
                    team: stats.team,
                    statType: 'PITCHING',
                    value: value,
                    displayValue: displayValue
                };

                allStats.push(stat);
                leaders.pitching.strikeouts.push(stat);
            }
        }

        console.log(`⚾ MLB stats processed - total count: ${allStats.length}`);

        // No stats collected, return empty array
        if (allStats.length === 0) {
            return [];
        }

        // Generate a ticker-friendly ordered list of the most relevant stats
        const orderedStats: PlayerStat[] = [];

        // Function to add top performers in each category
        const addTopPerformers = (category: PlayerStat[], count: number = 3) => {
            // Sort by value descending (or ascending for ERA)
            const sorted = [...category].sort((a, b) =>
                a.statType === 'ERA' ? a.value - b.value : b.value - a.value
            );

            // Take the top performers
            const topPerformers = sorted.slice(0, count);
            orderedStats.push(...topPerformers);
        };

        // Add team scores first
        addTopPerformers(leaders.teams.score, leaders.teams.score.length);

        // Add batter leaders
        if (leaders.batting.hr.length > 0) {
            addTopPerformers(leaders.batting.hr);
        }

        if (leaders.batting.rbi.length > 0) {
            addTopPerformers(leaders.batting.rbi);
        }

        if (leaders.batting.hits.length > 0) {
            addTopPerformers(leaders.batting.hits);
        }

        // Add pitcher leaders
        if (leaders.pitching.strikeouts.length > 0) {
            addTopPerformers(leaders.pitching.strikeouts);
        }

        // Remove duplicates (same player, same stat type)
        const uniqueStats: PlayerStat[] = [];
        const seen = new Set();

        for (const stat of orderedStats) {
            const key = `${stat.name}-${stat.team}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueStats.push(stat);
            }
        }

        console.log(`⚾ Final MLB stats for ticker: ${uniqueStats.length}`);
        return uniqueStats;
    } catch (error) {
        console.error('❌ Error processing MLB stats:', error);
        return [];
    }
}

/**
 * Extract key stats from displayValue string
 * Example: "2-4, HR, 4 RBI, 2 R, SB" -> "HR, 4 RBI"
 */
function extractStats(displayValue: string, statType: string): string | null {
    if (!displayValue) return null;

    try {
        const parts = displayValue.split(',').map(p => p.trim());
        const relevantParts = [];

        // Find stat types to display
        for (const part of parts) {
            // Skip the at-bat part (e.g., "2-4")
            if (part.match(/^\d+-\d+$/)) continue;

            // Add HR
            if (statType === 'HR' && part === 'HR') {
                relevantParts.push(part);
            }

            // Add RBI
            if (part.includes('RBI')) {
                relevantParts.push(part);
            }

            // Add Ks for pitchers
            if (statType === 'K' && part.includes('K')) {
                relevantParts.push(part);
            }
        }

        return relevantParts.length > 0 ? relevantParts.join(', ') : null;
    } catch {
        return null;
    }
}
