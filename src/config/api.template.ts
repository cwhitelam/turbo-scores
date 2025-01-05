// Template for API configuration
// Copy this file to api.ts and replace the values
const API_CONFIG = {
    // Base URL for the sports data API
    BASE_URL: 'YOUR_API_BASE_URL',

    // Endpoint paths for each sport
    ENDPOINTS: {
        NFL: '/your/nfl/endpoint',
        NBA: '/your/nba/endpoint',
        MLB: '/your/mlb/endpoint',
        NHL: '/your/nhl/endpoint'
    },

    // Request headers
    HEADERS: {
        'Accept': 'application/json',
        'User-Agent': 'TurboScores/1.0'
    }
};

export default API_CONFIG; 