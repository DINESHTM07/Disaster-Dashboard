




const EARTHQUAKE_API = {
  BASE_URL: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/",

  
  FEEDS: {
    HOUR: "all_hour.geojson",
    DAY: "all_day.geojson",
    WEEK: "all_week.geojson",
    MONTH: "all_month.geojson",
  },

  
  DEFAULT_FEED: "all_day.geojson",

  
  getUrl: function (feed = this.DEFAULT_FEED) {
    return this.BASE_URL + feed;
  },
};


const WEATHER_API = {
  BASE_URL: "https://api.open-meteo.com/v1/forecast",

  
  PARAMS: {
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    hourly: "temperature_2m",
    forecast_days: 1,
  },

  
  getUrl: function (latitude, longitude) {
    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      current: this.PARAMS.current,
      hourly: this.PARAMS.hourly,
      forecast_days: this.PARAMS.forecast_days,
    });
    return `${this.BASE_URL}?${params.toString()}`;
  },
};




const DEFAULT_LOCATION = {
  latitude: 11.6643,
  longitude: 78.146,
  city: "Salem, Tamil Nadu",
  country: "India",
};




const MAGNITUDE_LEVELS = {
  
  MICRO: 2.5,

  
  MINOR: 2.5,

  
  MODERATE: 4.5,

  
  STRONG: 6.0,

  
  MAJOR: 7.0,

  
  GREAT: 8.0,
};


function getMagnitudeSeverity(magnitude) {
  if (magnitude >= MAGNITUDE_LEVELS.STRONG) return "high";
  if (magnitude >= MAGNITUDE_LEVELS.MODERATE) return "medium";
  return "low";
}




const UI_CONFIG = {
  
  INITIAL_LOAD_COUNT: 20,

  
  LOAD_MORE_COUNT: 10,

  
  MAX_DISPLAY_COUNT: 100,

  
  REFRESH_INTERVAL: 5 * 60 * 1000, 

  
  TOAST_DURATION: 3000, 

  
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  
  SEARCH_DEBOUNCE: 500,
};




const STORAGE_KEYS = {
  THEME: "disasterwatch_theme", 
  LOCATION: "disasterwatch_location", 
  NOTIFICATIONS: "disasterwatch_notifications", 
  FILTERS: "disasterwatch_filters", 
  LAST_VISIT: "disasterwatch_last_visit", 
};




const WEATHER_CODES = {
  0: { description: "Clear sky", icon: "fa-sun" },
  1: { description: "Mainly clear", icon: "fa-cloud-sun" },
  2: { description: "Partly cloudy", icon: "fa-cloud" },
  3: { description: "Overcast", icon: "fa-cloud" },
  45: { description: "Foggy", icon: "fa-smog" },
  48: { description: "Depositing rime fog", icon: "fa-smog" },
  51: { description: "Light drizzle", icon: "fa-cloud-rain" },
  53: { description: "Moderate drizzle", icon: "fa-cloud-rain" },
  55: { description: "Dense drizzle", icon: "fa-cloud-showers-heavy" },
  61: { description: "Slight rain", icon: "fa-cloud-rain" },
  63: { description: "Moderate rain", icon: "fa-cloud-showers-heavy" },
  65: { description: "Heavy rain", icon: "fa-cloud-showers-heavy" },
  71: { description: "Slight snow", icon: "fa-snowflake" },
  73: { description: "Moderate snow", icon: "fa-snowflake" },
  75: { description: "Heavy snow", icon: "fa-snowflake" },
  80: { description: "Slight rain showers", icon: "fa-cloud-showers-heavy" },
  81: { description: "Moderate rain showers", icon: "fa-cloud-showers-heavy" },
  82: { description: "Violent rain showers", icon: "fa-cloud-showers-heavy" },
  95: { description: "Thunderstorm", icon: "fa-bolt" },
  96: { description: "Thunderstorm with slight hail", icon: "fa-bolt" },
  99: { description: "Thunderstorm with heavy hail", icon: "fa-bolt" },
};


function getWeatherInfo(code) {
  return (
    WEATHER_CODES[code] || {
      description: "Unknown",
      icon: "fa-question",
    }
  );
}




const ERROR_MESSAGES = {
  GEOLOCATION_DENIED: "Location access denied. Using default location.",
  GEOLOCATION_UNAVAILABLE:
    "Location service unavailable. Using default location.",
  GEOLOCATION_TIMEOUT: "Location request timed out. Using default location.",

  EARTHQUAKE_FETCH_FAILED:
    "Failed to load earthquake data. Please refresh the page.",
  WEATHER_FETCH_FAILED: "Failed to load weather data. Will retry shortly.",

  NETWORK_ERROR: "Network connection lost. Please check your internet.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",

  NO_DATA_AVAILABLE: "No earthquake data available for selected filters.",
};




const NOTIFICATION_CONFIG = {
  
  MIN_MAGNITUDE: 5.0,

  
  PROXIMITY_RADIUS: 500,

  
  TITLES: {
    low: "Minor Earthquake Detected",
    medium: "Moderate Earthquake Alert",
    high: "MAJOR EARTHQUAKE WARNING",
  },

  
  ICON: "/assets/icons/earthquake-icon.png",
};




const DEBUG_MODE = true; 


function debugLog(...args) {
  if (DEBUG_MODE) {
    console.log("[DisasterWatch]", ...args);
  }
}


function debugError(...args) {
  console.error("[DisasterWatch ERROR]", ...args);
}




const PERFORMANCE = {
  marks: {},

  
  start: function (label) {
    this.marks[label] = performance.now();
    debugLog(`⏱️ Started: ${label}`);
  },

  
  end: function (label) {
    if (this.marks[label]) {
      const duration = performance.now() - this.marks[label];
      debugLog(`✅ Completed: ${label} (${duration.toFixed(2)}ms)`);
      delete this.marks[label];
      return duration;
    }
  },
};





debugLog("✅ Configuration loaded successfully");
