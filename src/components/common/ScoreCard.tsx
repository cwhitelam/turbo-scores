import React from 'react';
import { Game, TeamInfo } from '../../types/game';
import { TeamDisplay } from '././TeamDisplay';
import { GameHeader } from '././GameHeader';
import { GameFooter } from '././GameFooter';
import { nbaTeamColors, nflTeamColors, mlbTeamColors, nhlTeamColors } from '../../data/colors';
import { useSport } from '../../context/SportContext';
import { GameContextProvider } from '../../context/GameContext';
import { StatsTicker } from '././StatsTicker';

const DEFAULT_COLORS = {
    primary: 'rgb(31, 41, 55)',
    secondary: 'rgb(209, 213, 219)'
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export const ScoreCard = React.memo(function ScoreCard(props: Game) {
    const { currentSport } = useSport();

    const getTeamColors = () => {
        switch (currentSport) {
            case 'NBA':
                return nbaTeamColors;
            case 'NFL':
                return nflTeamColors;
            case 'MLB':
                return mlbTeamColors;
            case 'NHL':
                return nhlTeamColors;
            default:
                return {};
        }
    };

    const convertToTeamInfo = (team: any): TeamInfo => ({
        id: team.id || team.abbreviation,
        name: team.name,
        abbreviation: team.abbreviation,
        score: team.score,
        record: team.record
    });

    const homeTeamInfo = convertToTeamInfo(props.homeTeam);
    const awayTeamInfo = convertToTeamInfo(props.awayTeam);

    const teamColors = getTeamColors();
    const awayColors = teamColors[props.awayTeam.abbreviation] || DEFAULT_COLORS;
    const homeColors = teamColors[props.homeTeam.abbreviation] || DEFAULT_COLORS;

    // Determine if possession should be shown based on game state
    const shouldShowPossession = currentSport === 'NFL' &&
        !props.quarter?.startsWith('FINAL') &&
        props.quarter !== '0Q' &&
        props.quarter !== 'HALFTIME' &&
        props.quarter !== 'DELAYED' &&
        !props.quarter?.startsWith('F');

    return (
        <GameContextProvider
            quarter={props.quarter}
            timeLeft={props.timeLeft}
            homeTeam={homeTeamInfo}
            awayTeam={awayTeamInfo}
        >
            <div className="rounded-xl overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur-sm border border-white/10">
                <GameHeader
                    quarter={props.quarter}
                    timeLeft={props.timeLeft}
                    startTime={props.startTime}
                    situation={props.situation}
                    awayTeam={props.awayTeam.abbreviation}
                    homeTeam={props.homeTeam.abbreviation}
                />
                <div className="flex-col">
                    <div className="flex">
                        <div
                            className="flex-1 border-r border-gray-900/50"
                            style={{
                                backgroundColor: awayColors.primary,
                                position: 'relative'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                            <TeamDisplay
                                team={awayTeamInfo}
                                gameId={props.id}
                                hasPossession={shouldShowPossession && props.situation?.possession === props.awayTeam.abbreviation}
                                isHomeTeam={false}
                                quarter={props.quarter}
                            />
                        </div>
                        <div
                            className="flex-1"
                            style={{
                                backgroundColor: homeColors.primary,
                                position: 'relative'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                            <TeamDisplay
                                team={homeTeamInfo}
                                gameId={props.id}
                                hasPossession={shouldShowPossession && props.situation?.possession === props.homeTeam.abbreviation}
                                isHomeTeam={true}
                                quarter={props.quarter}
                            />
                        </div>
                    </div>
                    <StatsTicker
                        gameId={props.id}
                        className="w-full"
                        sport={currentSport}
                        startTime={props.startTime}
                    />
                </div>
                <GameFooter
                    venue={props.venue}
                    weather={props.weather}
                />
            </div>
        </GameContextProvider>
    );
}); 