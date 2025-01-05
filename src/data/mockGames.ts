import { TimeSlot } from '../types/game';

export const timeSlots: TimeSlot[] = [
  {
    time: "1:00 PM ET",
    games: [
      {
        homeTeam: {
          name: "Philadelphia Eagles",
          abbreviation: "PHI",
          score: 24,
          winProbability: 65
        },
        awayTeam: {
          name: "Dallas Cowboys",
          abbreviation: "DAL",
          score: 17,
          winProbability: 35
        },
        location: "Lincoln Financial Field",
        weather: {
          temp: 72,
          condition: "Partly Cloudy"
        },
        quarter: "3rd",
        timeLeft: "8:45",
        startTime: "1:00 PM ET",
        situation: {
          down: 2,
          distance: 7,
          yardLine: 68,
          possession: "PHI"
        }
      },
      {
        homeTeam: {
          name: "Buffalo Bills",
          abbreviation: "BUF",
          score: 21,
          winProbability: 55
        },
        awayTeam: {
          name: "Miami Dolphins",
          abbreviation: "MIA",
          score: 21,
          winProbability: 45
        },
        location: "Highmark Stadium",
        weather: {
          temp: 65,
          condition: "Windy"
        },
        quarter: "2nd",
        timeLeft: "6:30",
        startTime: "1:00 PM ET",
        situation: {
          down: 1,
          distance: 10,
          yardLine: 25,
          possession: "MIA"
        }
      }
    ]
  },
  // ... rest of the timeSlots remain the same
];