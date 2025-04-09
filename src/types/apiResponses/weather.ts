/**
 * TypeScript definitions for Weather API responses
 */

export interface WeatherCoordinates {
    lat: number;
    lon: number;
}

export interface WeatherMain {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
}

export interface WeatherDescription {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface WeatherWind {
    speed: number;
    deg: number;
    gust?: number;
}

export interface WeatherClouds {
    all: number; // Cloud coverage percentage
}

export interface WeatherRain {
    '1h'?: number; // Rain volume for the last 1 hour, mm
    '3h'?: number; // Rain volume for the last 3 hours, mm
}

export interface WeatherSnow {
    '1h'?: number; // Snow volume for the last 1 hour, mm
    '3h'?: number; // Snow volume for the last 3 hours, mm
}

export interface WeatherSys {
    type?: number;
    id?: number;
    country: string;
    sunrise: number; // Sunrise time, unix, UTC
    sunset: number;  // Sunset time, unix, UTC
}

export interface CurrentWeatherResponse {
    coord: WeatherCoordinates;
    weather: WeatherDescription[];
    base: string;
    main: WeatherMain;
    visibility: number;
    wind: WeatherWind;
    clouds: WeatherClouds;
    rain?: WeatherRain;
    snow?: WeatherSnow;
    dt: number; // Time of data calculation, unix, UTC
    sys: WeatherSys;
    timezone: number; // Shift in seconds from UTC
    id: number; // City ID
    name: string; // City name
    cod: number; // Internal parameter
}

export interface WeatherForecastItem {
    dt: number;
    main: WeatherMain;
    weather: WeatherDescription[];
    clouds: WeatherClouds;
    wind: WeatherWind;
    visibility: number;
    pop: number; // Probability of precipitation
    rain?: WeatherRain;
    snow?: WeatherSnow;
    dt_txt: string; // Time of data forecasted, ISO format
}

export interface WeatherForecastCity {
    id: number;
    name: string;
    coord: WeatherCoordinates;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
}

export interface WeatherForecastResponse {
    cod: string;
    message: number;
    cnt: number; // Number of forecast timestamps returned
    list: WeatherForecastItem[];
    city: WeatherForecastCity;
}

/**
 * Processed weather data used in the application
 */
export interface ProcessedWeatherData {
    temperature: number;
    feelsLike: number;
    condition: string;
    conditionId: string;
    icon: string;
    wind: {
        speed: number;
        direction: string;
    };
    humidity: number;
    precipitation: number;
    forecast?: {
        hourly: Array<{
            time: string;
            temperature: number;
            condition: string;
            icon: string;
        }>;
        daily?: Array<{
            day: string;
            high: number;
            low: number;
            condition: string;
            icon: string;
        }>;
    };
    location: {
        city: string;
        country: string;
    };
    timestamp: number;
} 