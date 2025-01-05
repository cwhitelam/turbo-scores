import { SportConfig, SportType } from '../types/sports';

export const sportConfigs: Record<SportType, SportConfig> = {
    NFL: {
        name: 'NFL',
        displayName: 'National Football League',
        hasQuarters: true,
        defaultPeriodCount: 4,
        periodName: 'Quarter',
        statCategories: [
            'Passing',
            'Rushing',
            'Receiving',
            'Defense',
            'Kicking',
            'Returns'
        ],
        colors: {
            primary: '#013369',
            secondary: '#D50A0A'
        },
        icons: {
            league: '/icons/nfl/league.svg',
            team: '/icons/nfl/team.svg',
            game: '/icons/nfl/game.svg'
        }
    },
    NBA: {
        name: 'NBA',
        displayName: 'National Basketball Association',
        hasQuarters: true,
        defaultPeriodCount: 4,
        periodName: 'Quarter',
        statCategories: [
            'Points',
            'Rebounds',
            'Assists',
            'Steals',
            'Blocks',
            'Turnovers'
        ],
        colors: {
            primary: '#1D428A',
            secondary: '#C9082A'
        },
        icons: {
            league: '/icons/nba/league.svg',
            team: '/icons/nba/team.svg',
            game: '/icons/nba/game.svg'
        }
    },
    MLB: {
        name: 'MLB',
        displayName: 'Major League Baseball',
        hasQuarters: false,
        defaultPeriodCount: 9,
        periodName: 'Inning',
        statCategories: [
            'Batting',
            'Pitching',
            'Fielding',
            'Running'
        ],
        colors: {
            primary: '#002D72',
            secondary: '#E4002C'
        },
        icons: {
            league: '/icons/mlb/league.svg',
            team: '/icons/mlb/team.svg',
            game: '/icons/mlb/game.svg'
        }
    },
    NHL: {
        name: 'NHL',
        displayName: 'National Hockey League',
        hasQuarters: false,
        defaultPeriodCount: 3,
        periodName: 'Period',
        statCategories: [
            'Scoring',
            'Shots',
            'Penalties',
            'Power Play',
            'Faceoffs',
            'Time on Ice'
        ],
        colors: {
            primary: '#000000',
            secondary: '#FFFFFF'
        },
        icons: {
            league: '/icons/nhl/league.svg',
            team: '/icons/nhl/team.svg',
            game: '/icons/nhl/game.svg'
        }
    }
}; 