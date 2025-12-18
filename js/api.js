


const API_CACHE = {
    data: new Map(),
    
    
    get: function(key) {
        const cached = this.data.get(key);
        
        if (!cached) {
            return null;
        }
        
        const now = Date.now();
        const age = now - cached.timestamp;
        const maxAge = 5 * 60 * 1000;
        
        if (age > maxAge) {
            debugLog(`🗑️ Cache expired: ${key}`);
            this.data.delete(key);
            return null;
        }
        
        debugLog(`✅ Cache hit: ${key} (${Math.round(age / 1000)}s old)`);
        return cached.data;
    },
    
    
    set: function(key, data) {
        this.data.set(key, {
            data: data,
            timestamp: Date.now()
        });
        debugLog(`💾 Cached: ${key}`);
    },
    
    
    clear: function() {
        this.data.clear();
        debugLog('🧹 Cache cleared');
    }
};



async function fetchWithRetry(url, options = {}, retries = 3) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
        debugLog(`🌐 Fetching: ${url}`);
        PERFORMANCE.start('fetch');
        
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        PERFORMANCE.end('fetch');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        debugLog(`✅ Fetch successful: ${url}`);
        
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (retries > 0) {
            const delay = Math.pow(2, 3 - retries) * 1000;
            debugLog(`⚠️ Fetch failed, retrying in ${delay/1000}s... (${retries} attempts left)`);
            
            await sleep(delay);
            return fetchWithRetry(url, options, retries - 1);
        }
        
        debugError('❌ Fetch failed after all retries:', error);
        throw error;
    }
}



async function fetchEarthquakes(timeframe = 'day') {
    try {
        const cacheKey = `earthquakes_${timeframe}`;
        
        const cached = API_CACHE.get(cacheKey);
        if (cached) {
            return cached;
        }
        
        const feedMap = {
            'hour': EARTHQUAKE_API.FEEDS.HOUR,
            'day': EARTHQUAKE_API.FEEDS.DAY,
            'week': EARTHQUAKE_API.FEEDS.WEEK,
            'month': EARTHQUAKE_API.FEEDS.MONTH
        };
        
        const feed = feedMap[timeframe] || EARTHQUAKE_API.FEEDS.DAY;
        const url = EARTHQUAKE_API.getUrl(feed);
        
        const data = await fetchWithRetry(url);
        
        if (!data || !data.features || !Array.isArray(data.features)) {
            throw new Error('Invalid earthquake data structure');
        }
        
        const earthquakes = data.features;
        
        debugLog(`📊 Fetched ${earthquakes.length} earthquakes (${timeframe})`);
        
        API_CACHE.set(cacheKey, earthquakes);
        
        return earthquakes;
        
    } catch (error) {
        debugError('Failed to fetch earthquakes:', error);
        
        showToast(ERROR_MESSAGES.EARTHQUAKE_FETCH_FAILED, 'error');
        return [];
    }
}


async function fetchEarthquakeDetails(earthquakeId) {
    try {
        const cacheKey = `earthquake_${earthquakeId}`;
        const cached = API_CACHE.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/${earthquakeId}.geojson`;
        
        const data = await fetchWithRetry(url);
        
        API_CACHE.set(cacheKey, data);
        
        return data;
        
    } catch (error) {
        debugError('Failed to fetch earthquake details:', error);
        throw error;
    }
}


function filterEarthquakes(earthquakes, filters = {}) {
    let filtered = [...earthquakes];
    
    if (filters.minMagnitude !== undefined && filters.minMagnitude > 0) {
        filtered = filtered.filter(eq => 
            eq.properties.mag >= filters.minMagnitude
        );
        debugLog(`🔍 Filtered by magnitude >= ${filters.minMagnitude}: ${filtered.length} results`);
    }
    
    if (filters.maxMagnitude !== undefined) {
        filtered = filtered.filter(eq => 
            eq.properties.mag <= filters.maxMagnitude
        );
    }
    
    if (filters.startTime) {
        filtered = filtered.filter(eq => 
            eq.properties.time >= filters.startTime
        );
    }
    
    if (filters.endTime) {
        filtered = filtered.filter(eq => 
            eq.properties.time <= filters.endTime
        );
    }
    
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(eq => 
            eq.properties.place.toLowerCase().includes(searchLower)
        );
        debugLog(`🔍 Filtered by search "${filters.searchTerm}": ${filtered.length} results`);
    }
    
    if (filters.latitude && filters.longitude && filters.radius) {
        filtered = filtered.filter(eq => {
            const [eqLon, eqLat] = eq.geometry.coordinates;
            const distance = calculateDistance(
                filters.latitude,
                filters.longitude,
                eqLat,
                eqLon
            );
            return distance <= filters.radius;
        });
        debugLog(`🔍 Filtered by proximity (${filters.radius}km): ${filtered.length} results`);
    }
    
    return filtered;
}


function sortEarthquakes(earthquakes, sortBy = 'time', order = 'desc') {
    const sorted = [...earthquakes].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'magnitude':
                aValue = a.properties.mag;
                bValue = b.properties.mag;
                break;
                
            case 'depth':
                aValue = a.geometry.coordinates[2];
                bValue = b.geometry.coordinates[2];
                break;
                
            case 'time':
            default:
                aValue = a.properties.time;
                bValue = b.properties.time;
                break;
        }
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (order === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });
    
    debugLog(`🔢 Sorted by ${sortBy} (${order}): ${sorted.length} earthquakes`);
    return sorted;
}



async function fetchWeather(latitude, longitude) {
    try {
        if (!isValidCoordinates(latitude, longitude)) {
            throw new Error('Invalid coordinates');
        }
        
        const lat = latitude.toFixed(2);
        const lon = longitude.toFixed(2);
        const cacheKey = `weather_${lat}_${lon}`;
        
        const cached = API_CACHE.get(cacheKey);
        if (cached) {
            return cached;
        }
        
        const url = WEATHER_API.getUrl(latitude, longitude);
        
        const data = await fetchWithRetry(url);
        
        if (!data || !data.current) {
            throw new Error('Invalid weather data structure');
        }
        
        debugLog(`🌤️ Fetched weather for (${lat}, ${lon})`);
        
        API_CACHE.set(cacheKey, data);
        
        return data;
        
    } catch (error) {
        debugError('Failed to fetch weather:', error);
        showToast(ERROR_MESSAGES.WEATHER_FETCH_FAILED, 'warning');
        
        return null;
    }
}


function formatWeatherData(weatherData) {
    if (!weatherData || !weatherData.current) {
        return null;
    }

    const current = weatherData.current;

    const weatherCode = current.weather_code ?? current.weathercode ?? current.weather ?? null;
    const tempC = current.temperature_2m ?? current.temperature ?? current.temp ?? null;
    const humidityVal = current.relative_humidity_2m ?? current.humidity ?? null;
    const windVal = current.wind_speed_10m ?? current.windspeed_10m ?? current.wind_speed ?? null;

    const weatherInfo = getWeatherInfo(weatherCode);

    debugLog('🌤️ Formatting weather data', { tempC, humidityVal, windVal, weatherCode });

    return {
        temperature: tempC !== null && tempC !== undefined ? `${Math.round(tempC)}°C` : '--',
        temperatureF: tempC !== null && tempC !== undefined ? `${Math.round(tempC * 9/5 + 32)}°F` : '--',
        humidity: humidityVal !== null && humidityVal !== undefined ? `${humidityVal}%` : '--',
        windSpeed: windVal !== null && windVal !== undefined ? `${Math.round(windVal)} km/h` : '--',
        windSpeedMph: windVal !== null && windVal !== undefined ? `${Math.round(windVal * 0.621371)} mph` : '--',
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        code: weatherCode,
        timestamp: current.time ?? weatherData.time ?? null
    };
}



async function getUserLocationData() {
    try {
        debugLog('📍 Requesting user location...');
        
        const position = await getUserLocation({
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000
        });
        
        debugLog(`✅ Got user location: ${position.latitude}, ${position.longitude}`);
        
        const locationData = {
            latitude: position.latitude,
            longitude: position.longitude,
            city: 'Your Location',
            accuracy: position.accuracy
        };
        
        saveToStorage(STORAGE_KEYS.LOCATION, locationData);
        
        showToast('Location detected successfully', 'success');
        
        return locationData;
        
    } catch (error) {
        debugLog('⚠️ Geolocation failed, using default location');
        
        let message = ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
        
        if (error.code === 1) {
            message = ERROR_MESSAGES.GEOLOCATION_DENIED;
        } else if (error.code === 3) {
            message = ERROR_MESSAGES.GEOLOCATION_TIMEOUT;
        }
        
        showToast(message, 'info');
        
        const savedLocation = getFromStorage(STORAGE_KEYS.LOCATION);
        if (savedLocation) {
            debugLog('📍 Using saved location');
            return savedLocation;
        }
        
        debugLog('📍 Using default location');
        return DEFAULT_LOCATION;
    }
}



function calculateEarthquakeStats(earthquakes) {
    if (!earthquakes || earthquakes.length === 0) {
        return {
            total: 0,
            maxMagnitude: 0,
            minMagnitude: 0,
            averageMagnitude: 0,
            maxDepth: 0,
            minDepth: 0,
            averageDepth: 0,
            byMagnitudeLevel: { low: 0, medium: 0, high: 0 }
        };
    }
    
    const magnitudes = earthquakes.map(eq => eq.properties.mag).filter(m => m !== null);
    const depths = earthquakes.map(eq => eq.geometry.coordinates[2]).filter(d => d !== null);
    
    const stats = {
        total: earthquakes.length,
        maxMagnitude: Math.max(...magnitudes),
        minMagnitude: Math.min(...magnitudes),
        averageMagnitude: magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length,
        maxDepth: Math.max(...depths),
        minDepth: Math.min(...depths),
        averageDepth: depths.reduce((a, b) => a + b, 0) / depths.length,
        byMagnitudeLevel: {
            low: 0,
            medium: 0,
            high: 0
        }
    };
    
    earthquakes.forEach(eq => {
        const severity = getMagnitudeSeverity(eq.properties.mag);
        stats.byMagnitudeLevel[severity]++;
    });
    
    debugLog('📊 Calculated statistics:', stats);
    
    return stats;
}


function findPeakEarthquake(earthquakes) {
    if (!earthquakes || earthquakes.length === 0) {
        return null;
    }
    
    return earthquakes.reduce((max, eq) => {
        return eq.properties.mag > max.properties.mag ? eq : max;
    });
}



function shouldNotify(earthquake, userLocation) {
    const magnitude = earthquake.properties.mag;
    const [eqLon, eqLat] = earthquake.geometry.coordinates;
    
    if (magnitude < NOTIFICATION_CONFIG.MIN_MAGNITUDE) {
        return false;
    }
    
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            eqLat,
            eqLon
        );
        
        if (distance > NOTIFICATION_CONFIG.PROXIMITY_RADIUS) {
            return false;
        }
    }
    
    return true;
}



async function refreshAllData(userLocation) {
    try {
        debugLog('🔄 Refreshing all data...');
        PERFORMANCE.start('refreshAll');
        
        const [earthquakes, weather] = await Promise.all([
            fetchEarthquakes('day'),
            userLocation ? fetchWeather(userLocation.latitude, userLocation.longitude) : null
        ]);
        
        PERFORMANCE.end('refreshAll');
        
        debugLog(`✅ Refresh complete: ${earthquakes.length} earthquakes, weather: ${weather ? 'OK' : 'N/A'}`);
        
        return {
            earthquakes,
            weather
        };
        
    } catch (error) {
        debugError('Failed to refresh data:', error);
        showToast(ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
        
        return {
            earthquakes: [],
            weather: null
        };
    }
}



async function checkAPIHealth() {
    const status = {
        usgs: false,
        weather: false
    };
    
    try {
        const earthquakeUrl = EARTHQUAKE_API.getUrl();
        const eqResponse = await fetch(earthquakeUrl, { method: 'HEAD' });
        status.usgs = eqResponse.ok;
        
        const weatherUrl = WEATHER_API.getUrl(0, 0);
        const weatherResponse = await fetch(weatherUrl, { method: 'HEAD' });
        status.weather = weatherResponse.ok;
        
    } catch (error) {
        debugError('API health check failed:', error);
    }
    
    debugLog('🏥 API Health:', status);
    return status;
}


debugLog('✅ API layer loaded successfully');
debugLog(`📡 Available API functions:
    - fetchEarthquakes(timeframe)
    - fetchEarthquakeDetails(id)
    - filterEarthquakes(earthquakes, filters)
    - sortEarthquakes(earthquakes, sortBy, order)
    - fetchWeather(lat, lon)
    - getUserLocationData()
    - refreshAllData(location)
    - calculateEarthquakeStats(earthquakes)`);
