




const APP_STATE = {
    
    earthquakes: [],           
    filteredEarthquakes: [],   
    displayedEarthquakes: [],  
    weather: null,             
    location: null,            
    
    
    currentView: 'list',       
    isLoading: false,          
    darkMode: false,           
    
    
    filters: {
        minMagnitude: 2.5,
        timeframe: 'day',
        searchTerm: '',
        sortBy: 'time',
        sortOrder: 'desc'
    },
    
    
    pagination: {
        currentPage: 1,
        itemsPerPage: 20,
        totalPages: 1
    },
    
    
    refreshInterval: null
};




const DOM = {
    
    app: null,
    loadingScreen: null,
    earthquakeList: null,
    toastContainer: null,
    
    
    weatherContent: null,
    weatherLocation: null,
    alertsCount: null,
    lastUpdateTime: null,
    peakMagnitude: null,
    peakLocation: null,
    
    
    apiStatusUSGS: null,
    apiStatusWeather: null,
    
    
    magnitudeFilter: null,
    timeFilter: null,
    sortFilter: null,
    searchFilter: null,
    
    
    locationBtn: null,
    themeToggle: null,
    refreshBtn: null,
    notificationsBtn: null,
    loadMoreBtn: null,
    
    
    viewBtns: null,
    listView: null,
    mapView: null,
    
    
    modal: null,
    modalBody: null,
    modalClose: null,
    
    
    resultsCount: null,
    noResults: null,
    alertBanner: null
};



let LAST_FOCUSED_ELEMENT = null;

let MODAL_KEYDOWN_HANDLER = null;




async function initApp() {
    debugLog('🚀 Initializing DisasterWatch...');
    PERFORMANCE.start('appInit');
    
    const INIT_TIMEOUT = setTimeout(() => {
        debugError('⚠️ Initialization timeout');
        try {
            
            renderDashboard();
        } catch (e) {
            debugError('Failed to render fallback dashboard after timeout:', e);
        }

        
        if (!DOM.app) DOM.app = getElement('#app');
        if (DOM.app) DOM.app.classList.remove('hidden');

        hideLoadingScreen();
        showToast('Initialization timeout. Some features may be unavailable.', 'warning');
    }, 12000);
    
    try {
        
        cacheDOMElements();
        
        
        loadSavedPreferences();
        
        
        setupEventListeners();
        
        
        await initializeLocation();
        
        
        await loadInitialData();
        
        
        renderDashboard();
        
        
        startAutoRefresh();
        
        
        hideLoadingScreen();

        
        clearTimeout(INIT_TIMEOUT);
        
        
        checkAPIsStatus();
        
        PERFORMANCE.end('appInit');
        debugLog('✅ App initialized successfully!');
        
        
        showToast('Welcome to DisasterWatch! 🌍', 'success');
        
    } catch (error) {
        debugError('Failed to initialize app:', error);
        showToast('Failed to initialize app. Please refresh.', 'error');
        clearTimeout(INIT_TIMEOUT);
        hideLoadingScreen();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initApp();
});


function cacheDOMElements() {
    debugLog('📦 Caching DOM elements...');
    
    
    DOM.app = getElement('#app');
    DOM.loadingScreen = getElement('#loading-screen');
    DOM.earthquakeList = getElement('#earthquake-list');
    DOM.toastContainer = getElement('#toast-container');
    
    
    DOM.weatherContent = getElement('#weather-content');
    DOM.weatherLocation = getElement('#weather-location');
    DOM.alertsCount = getElement('#alerts-count');
    DOM.lastUpdateTime = getElement('#last-update-time');
    DOM.peakMagnitude = getElement('#peak-magnitude');
    DOM.peakLocation = getElement('#peak-location');
    
    
    DOM.apiStatusUSGS = getElement('#api-status-usgs');
    DOM.apiStatusWeather = getElement('#api-status-weather');
    
    
    DOM.magnitudeFilter = getElement('#magnitude-filter');
    DOM.timeFilter = getElement('#time-filter');
    DOM.sortFilter = getElement('#sort-filter');
    DOM.searchFilter = getElement('#search-filter');
    
    
    
    
    DOM.locationBtn = getElement('#location-btn') || getElement('#loaction-btn');
    DOM.themeToggle = getElement('#theme-toggle');
    DOM.refreshBtn = getElement('#refresh-btn');
    DOM.notificationsBtn = getElement('#notifications-btn');
    DOM.loadMoreBtn = getElement('#load-more-btn');
    
    
    DOM.viewBtns = getElements('.view-btn');
    DOM.listView = getElement('.earthquake-section');
    DOM.mapView = getElement('#map-view');
    
    
    DOM.modal = getElement('#earthquake-modal');
    DOM.modalBody = getElement('#modal-body');
    DOM.modalClose = getElement('.modal-close');
    
    
    DOM.resultsCount = getElement('#results-count');
    DOM.noResults = getElement('#no-results');
    DOM.alertBanner = getElement('#alert-banner');

    
    DOM.loadError = getElement('#load-error');
    DOM.retryLoadBtn = getElement('#retry-load-btn');
    DOM.useCacheBtn = getElement('#use-cache-btn');
    
    debugLog('✅ DOM elements cached');
}


function loadSavedPreferences() {
    debugLog('💾 Loading saved preferences...');
    
    
    const savedTheme = getFromStorage(STORAGE_KEYS.THEME, 'light');
    APP_STATE.darkMode = savedTheme === 'dark';
    
    if (APP_STATE.darkMode) {
        document.body.classList.add('dark-mode');
        if (DOM.themeToggle) {
            const icon = DOM.themeToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-sun';
        }
    }
    
    
    const savedLocation = getFromStorage(STORAGE_KEYS.LOCATION);
    if (savedLocation) {
        APP_STATE.location = savedLocation;
        debugLog('📍 Loaded saved location:', savedLocation.city);
    }
    
    
    const savedFilters = getFromStorage(STORAGE_KEYS.FILTERS);
    if (savedFilters) {
        APP_STATE.filters = { ...APP_STATE.filters, ...savedFilters };
        debugLog('🔍 Loaded saved filters');
    }
    
    debugLog('✅ Preferences loaded');
}




function setupEventListeners() {
    debugLog('🎧 Setting up event listeners...');
    
    
    
    
    if (DOM.locationBtn) {
        DOM.locationBtn.addEventListener('click', handleLocationClick);
    }
    
    
    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', handleThemeToggle);
    }
    
    
    if (DOM.refreshBtn) {
        DOM.refreshBtn.addEventListener('click', handleRefreshClick);
    }
    
    
    if (DOM.notificationsBtn) {
        DOM.notificationsBtn.addEventListener('click', handleNotificationsClick);
    }
    
    
    
    
    if (DOM.magnitudeFilter) {
        DOM.magnitudeFilter.addEventListener('change', handleMagnitudeFilterChange);
    }
    
    
    if (DOM.timeFilter) {
        DOM.timeFilter.addEventListener('change', handleTimeFilterChange);
    }
    
    
    if (DOM.sortFilter) {
        DOM.sortFilter.addEventListener('change', handleSortFilterChange);
    }
    
    
    if (DOM.searchFilter) {
        const debouncedSearch = debounce(handleSearchFilterChange, 500);
        DOM.searchFilter.addEventListener('input', debouncedSearch);
    }
    
    
    
    DOM.viewBtns.forEach(btn => {
        btn.addEventListener('click', handleViewToggle);
    });
    
    
    
    if (DOM.loadMoreBtn) {
        DOM.loadMoreBtn.addEventListener('click', handleLoadMore);
    }
    
    
    
    if (DOM.modalClose) {
        DOM.modalClose.addEventListener('click', closeModal);
    }

    
    if (DOM.retryLoadBtn) {
        DOM.retryLoadBtn.addEventListener('click', handleRetryLoad);
    }
    if (DOM.useCacheBtn) {
        DOM.useCacheBtn.addEventListener('click', handleUseCacheData);
    }
    
    if (DOM.modal) {
        
        DOM.modal.addEventListener('click', (e) => {
            if (e.target === DOM.modal || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }

    
    if (DOM.alertBanner) {
        const alertClose = DOM.alertBanner.querySelector('.alert-close');
        if (alertClose) {
            alertClose.addEventListener('click', () => toggleElement(DOM.alertBanner, false));
        }

        const viewBtn = DOM.alertBanner.querySelector('#view-alert-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Scroll to earthquake list and open first item
                const target = getElement('#earthquake-list');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }
    
    
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    
    
    
    // Smooth scroll from hero CTA to earthquake list
    const getStartedBtn = getElement('#get-started');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = getElement('#earthquake-heading');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    debugLog('✅ Event listeners set up');
}




async function handleLocationClick() {
    debugLog('📍 Location button clicked');
    
    try {
        
        DOM.locationBtn.disabled = true;
        DOM.locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Getting location...</span>';
        
        
        const location = await getUserLocationData();
        APP_STATE.location = location;
        
        
        await updateWeather();
        
        
        renderEarthquakeList();
        
        DOM.locationBtn.disabled = false;
        DOM.locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> <span class="btn-text">My Location</span>';
        
    } catch (error) {
        debugError('Location error:', error);
        DOM.locationBtn.disabled = false;
        DOM.locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> <span class="btn-text">My Location</span>';
    }
}


function handleThemeToggle() {
    debugLog('🎨 Theme toggle clicked');
    
    APP_STATE.darkMode = !APP_STATE.darkMode;
    
    
    document.body.classList.toggle('dark-mode');
    
    
    const icon = DOM.themeToggle.querySelector('i');
    if (icon) {
        icon.className = APP_STATE.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    
    saveToStorage(STORAGE_KEYS.THEME, APP_STATE.darkMode ? 'dark' : 'light');
    
    showToast(`${APP_STATE.darkMode ? 'Dark' : 'Light'} mode enabled`, 'info');
}


async function handleRefreshClick() {
    debugLog('🔄 Refresh button clicked');
    
    
    const icon = DOM.refreshBtn.querySelector('i');
    if (icon) {
        icon.style.animation = 'spin 1s ease-in-out';
        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
    }
    
    
    API_CACHE.clear();
    
    
    await loadInitialData();
    renderDashboard();
    
    showToast('Data refreshed successfully', 'success');
}


async function handleNotificationsClick() {
    debugLog('🔔 Notifications button clicked');
    
    
    if (!('Notification' in window)) {
        showToast('Notifications not supported in this browser', 'error');
        return;
    }
    
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        showToast('Notifications enabled!', 'success');
        
        
        new Notification('DisasterWatch', {
            body: 'You will now receive earthquake alerts',
            icon: '/assets/icons/earthquake-icon.png'
        });
    } else {
        showToast('Notifications permission denied', 'error');
    }
}


function handleMagnitudeFilterChange(event) {
    debugLog('🔍 Magnitude filter changed:', event.target.value);
    
    APP_STATE.filters.minMagnitude = parseFloat(event.target.value);
    
    
    saveToStorage(STORAGE_KEYS.FILTERS, APP_STATE.filters);
    
    
    applyFilters();
    renderEarthquakeList();
}


async function handleTimeFilterChange(event) {
    debugLog('⏰ Time filter changed:', event.target.value);
    
    APP_STATE.filters.timeframe = event.target.value;
    
    
    saveToStorage(STORAGE_KEYS.FILTERS, APP_STATE.filters);
    
    
    showToast('Loading earthquakes...', 'info');
    
    APP_STATE.earthquakes = await fetchEarthquakes(APP_STATE.filters.timeframe);
    
    applyFilters();
    renderDashboard();
}


function handleSortFilterChange(event) {
    debugLog('📊 Sort filter changed:', event.target.value);
    
    APP_STATE.filters.sortBy = event.target.value;
    
    
    saveToStorage(STORAGE_KEYS.FILTERS, APP_STATE.filters);
    
    
    applyFilters();
    renderEarthquakeList();
}


function handleSearchFilterChange(event) {
    debugLog('🔎 Search filter changed:', event.target.value);
    
    APP_STATE.filters.searchTerm = event.target.value;
    
    
    applyFilters();
    renderEarthquakeList();
}


function handleViewToggle(event) {
    const btn = event.currentTarget;
    const view = btn.dataset.view;
    
    debugLog('👁️ View toggled:', view);
    
    APP_STATE.currentView = view;
    
    
    DOM.viewBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
    
    
    if (view === 'list') {
        toggleElement(DOM.listView, true);
        toggleElement(DOM.mapView, false);
    } else {
        toggleElement(DOM.listView, false);
        toggleElement(DOM.mapView, true);
        renderMap();
    }
}


function handleLoadMore() {
    debugLog('📄 Load more clicked');
    
    APP_STATE.pagination.currentPage++;
    
    const start = (APP_STATE.pagination.currentPage - 1) * APP_STATE.pagination.itemsPerPage;
    const end = start + APP_STATE.pagination.itemsPerPage;
    
    const moreEarthquakes = APP_STATE.filteredEarthquakes.slice(start, end);
    
    
    APP_STATE.displayedEarthquakes.push(...moreEarthquakes);
    
    
    moreEarthquakes.forEach(earthquake => {
        const card = createEarthquakeCard(earthquake);
        DOM.earthquakeList.appendChild(card);
    });
    
    
    if (APP_STATE.displayedEarthquakes.length >= APP_STATE.filteredEarthquakes.length) {
        toggleElement(DOM.loadMoreBtn.parentElement, false);
    }
    
    showToast(`Loaded ${moreEarthquakes.length} more earthquakes`, 'success');
}


function handleKeyboardShortcuts(event) {
    
    if (event.key === 'Escape' && DOM.modal && !DOM.modal.classList.contains('hidden')) {
        closeModal();
    }
    
    
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        DOM.searchFilter?.focus();
    }
    
    
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleRefreshClick();
    }
    
    
    if (event.key === 'd' && !event.ctrlKey && !event.metaKey) {
        const activeElement = document.activeElement;
        
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
            handleThemeToggle();
        }
    }
}


function handleOnline() {
    debugLog('🌐 Connection restored');
    showToast('Connection restored. Refreshing data...', 'success');
    handleRefreshClick();
}


function handleOffline() {
    debugLog('📡 Connection lost');
    showToast('No internet connection. Using cached data.', 'warning');
}


function handleVisibilityChange() {
    if (document.hidden) {
        debugLog('👁️ Page hidden');
        
        stopAutoRefresh();
    } else {
        debugLog('👁️ Page visible');
        
        startAutoRefresh();
        
        
        const lastUpdate = getFromStorage(STORAGE_KEYS.LAST_VISIT);
        if (lastUpdate && (Date.now() - lastUpdate > 5 * 60 * 1000)) {
            handleRefreshClick();
        }
    }
}




async function initializeLocation() {
    debugLog('📍 Initializing location...');
    
    try {
        
        APP_STATE.location = await getUserLocationData();
        debugLog('✅ Location initialized:', APP_STATE.location.city);
    } catch (error) {
        debugLog('⚠️ Using default location');
        APP_STATE.location = DEFAULT_LOCATION;
    }
}


async function loadInitialData() {
    debugLog('📥 Loading initial data...');
    APP_STATE.isLoading = true;

    try {
        
        const { earthquakes, weather } = await refreshAllData(APP_STATE.location);

        
        APP_STATE.earthquakes = earthquakes;
        APP_STATE.weather = weather;

        
        applyFilters();

        
        saveToStorage(STORAGE_KEYS.LAST_VISIT, Date.now());

        debugLog(`✅ Loaded ${earthquakes.length} earthquakes`);

    } catch (error) {
        debugError('Failed to load initial data:', error);

        
        const cached = API_CACHE.get('earthquakes_day');
        if (cached && cached.length > 0) {
            debugLog('Using cached earthquake data after fetch failure');
            APP_STATE.earthquakes = cached;
            APP_STATE.weather = null;
            applyFilters();
            showToast('Using cached earthquake data due to network failure', 'warning');
        } else {
            
            if (DOM.loadError) {
                toggleElement(DOM.loadError, true);
            }

            showToast('Failed to load data. You can retry.', 'error');
        }

    } finally {
        APP_STATE.isLoading = false;
    }
}

async function handleRetryLoad() {
    if (DOM.loadError) toggleElement(DOM.loadError, false);
    showLoadingScreen();

    try {
        await loadInitialData();
        renderDashboard();
        hideLoadingScreen();
        showToast('Data loaded successfully', 'success');
    } catch (error) {
        hideLoadingScreen();
        debugError('Retry failed:', error);
        if (DOM.loadError) toggleElement(DOM.loadError, true);
        showToast('Retry failed. Try again later.', 'error');
    }
}

function handleUseCacheData() {
    const cached = API_CACHE.get('earthquakes_day');
    if (cached && cached.length > 0) {
        APP_STATE.earthquakes = cached;
        APP_STATE.weather = null;
        applyFilters();
        renderDashboard();
        if (DOM.loadError) toggleElement(DOM.loadError, false);
        showToast('Loaded cached data', 'info');
    } else {
        showToast('No cached data available', 'warning');
    }
}


function applyFilters() {
    debugLog('🔍 Applying filters...');
    
    
    let filtered = [...APP_STATE.earthquakes];
    
    
    if (APP_STATE.filters.minMagnitude > 0) {
        filtered = filterEarthquakes(filtered, {
            minMagnitude: APP_STATE.filters.minMagnitude
        });
    }
    
    
    if (APP_STATE.filters.searchTerm) {
        filtered = filterEarthquakes(filtered, {
            searchTerm: APP_STATE.filters.searchTerm
        });
    }
    
    
    filtered = sortEarthquakes(
        filtered,
        APP_STATE.filters.sortBy,
        APP_STATE.filters.sortOrder
    );
    
    
    APP_STATE.filteredEarthquakes = filtered;
    
    
    APP_STATE.pagination.currentPage = 1;
    APP_STATE.pagination.totalPages = Math.ceil(
        filtered.length / APP_STATE.pagination.itemsPerPage
    );
    
    
    APP_STATE.displayedEarthquakes = filtered.slice(
        0,
        APP_STATE.pagination.itemsPerPage
    );
    
    debugLog(`✅ Filtered: ${filtered.length} earthquakes`);
}




function renderDashboard() {
    debugLog('🎨 Rendering dashboard...');
    PERFORMANCE.start('render');
    
    
    updateStatsCards();
    
    
    updateWeatherCard();
    
    
    renderEarthquakeList();
    
    
    updateLastUpdateTime();
    
    PERFORMANCE.end('render');
    debugLog('✅ Dashboard rendered');
}


function updateStatsCards() {
    
    const stats = calculateEarthquakeStats(APP_STATE.filteredEarthquakes);
    const peak = findPeakEarthquake(APP_STATE.filteredEarthquakes);

    
    if (DOM.alertsCount) {
        const numberEl = DOM.alertsCount.querySelector('.stat-number');
        if (numberEl) {
            numberEl.textContent = stats.total;
        }
    }

    
    if (DOM.peakMagnitude && peak) {
        const numberEl = DOM.peakMagnitude.querySelector('.stat-number');
        if (numberEl) {
            numberEl.textContent = formatNumber(peak.properties.mag, 1);
        }
    }

    if (DOM.peakLocation && peak) {
        DOM.peakLocation.textContent = truncate(peak.properties.place, 50);
    }

    
    checkForHighMagnitudeAlerts();
}


function updateWeatherCard() {
    if (!DOM.weatherContent || !APP_STATE.weather) return;

    const weather = formatWeatherData(APP_STATE.weather);

    if (!weather) {
        DOM.weatherContent.innerHTML = '<p class="text-secondary">Weather data unavailable</p>';
        return;
    }

    DOM.weatherContent.innerHTML = `
        <div class="weather-temp">${weather.temperature}</div>
        <div class="weather-details">
            <p><i class="fas ${weather.icon}"></i> ${weather.description}</p>
            <p><i class="fas fa-wind"></i> Wind: ${weather.windSpeed}</p>
            <p><i class="fas fa-droplet"></i> Humidity: ${weather.humidity}</p>
        </div>
    `;

    if (DOM.weatherLocation && APP_STATE.location) {
        DOM.weatherLocation.innerHTML = `
            <i class="fas fa-location-dot"></i>
            ${APP_STATE.location.city}
        `;
    }

    
    updateLastUpdateTime();
}


function showLoadingScreen() {
    if (!DOM.loadingScreen) DOM.loadingScreen = getElement('#loading-screen');
    if (!DOM.loadingScreen) return;
    
    DOM.loadingScreen.classList.remove('hidden');
    
    DOM.loadingScreen.classList.remove('fade-out');
}

function hideLoadingScreen() {
    if (!DOM.loadingScreen) DOM.loadingScreen = getElement('#loading-screen');
    if (!DOM.loadingScreen) return;

    
    toggleElement(DOM.loadingScreen, false);

    
    if (!DOM.app) DOM.app = getElement('#app');
    if (DOM.app) {
        DOM.app.classList.remove('hidden');
        DOM.app.style.opacity = '';
        DOM.app.style.display = '';
    }

    debugLog(`🎬 Loading screen hidden; earthquakes: ${APP_STATE.earthquakes?.length || 0}, filtered: ${APP_STATE.filteredEarthquakes?.length || 0}`);
}

function openModal() {
    if (!DOM.modal) return;

    
    LAST_FOCUSED_ELEMENT = document.activeElement;

    toggleElement(DOM.modal, true);
    document.body.classList.add('modal-open');

    
    if (DOM.app) DOM.app.setAttribute('aria-hidden', 'true');

    
    const focusable = DOM.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable && focusable[0];
    if (first) first.focus();

    
    MODAL_KEYDOWN_HANDLER = function (e) {
        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = Array.from(DOM.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
                .filter(el => !el.disabled && el.offsetParent !== null);

            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }

            const idx = focusables.indexOf(document.activeElement);
            if (e.shiftKey) {
                
                if (idx === 0) {
                    focusables[focusables.length - 1].focus();
                    e.preventDefault();
                }
            } else {
                
                if (idx === focusables.length - 1) {
                    focusables[0].focus();
                    e.preventDefault();
                }
            }
        }
    };

    document.addEventListener('keydown', MODAL_KEYDOWN_HANDLER);
}

function closeModal() {
    if (!DOM.modal) return;

    
    if (MODAL_KEYDOWN_HANDLER) {
        document.removeEventListener('keydown', MODAL_KEYDOWN_HANDLER);
        MODAL_KEYDOWN_HANDLER = null;
    }

    toggleElement(DOM.modal, false);
    document.body.classList.remove('modal-open');
    if (DOM.modalBody) DOM.modalBody.innerHTML = '';

    
    if (DOM.app) DOM.app.removeAttribute('aria-hidden');

    
    if (LAST_FOCUSED_ELEMENT && typeof LAST_FOCUSED_ELEMENT.focus === 'function') {
        LAST_FOCUSED_ELEMENT.focus();
        LAST_FOCUSED_ELEMENT = null;
    }
}

function updateLastUpdateTime() {
    if (!DOM.lastUpdateTime) return;
    const last = getFromStorage(STORAGE_KEYS.LAST_VISIT);
    DOM.lastUpdateTime.textContent = last ? `Updated ${getTimeAgo(last)}` : 'Updated now';
}

function renderMap() {
    const container = getElement('#earthquake-map');
    if (!container) return;

    
    container.style.position = 'relative';
    container.innerHTML = '';
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const items = APP_STATE.filteredEarthquakes.slice(0, UI_CONFIG.MAX_DISPLAY_COUNT);
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-secondary">No earthquakes to show on map</p>';
        return;
    }

    items.forEach(eq => {
        const [lon, lat] = eq.geometry.coordinates;
        
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;

        const severity = getMagnitudeSeverity(eq.properties.mag);
        const dot = createElement('button', { class: `map-dot magnitude-${severity}`, 'data-id': eq.id, 'title': `${eq.properties.mag} • ${truncate(eq.properties.place, 60)}` });

        
        const ariaLabel = `M ${formatNumber(eq.properties.mag, 1)} • ${truncate(eq.properties.place, 60)}`;
        dot.setAttribute('aria-label', ariaLabel);
        dot.setAttribute('aria-haspopup', 'dialog');

        
        dot.style.position = 'absolute';
        dot.style.left = `${Math.max(0, Math.min(width - 8, x))}px`;
        dot.style.top = `${Math.max(0, Math.min(height - 8, y))}px`;
        dot.style.width = '10px';
        dot.style.height = '10px';
        dot.style.borderRadius = '50%';
        dot.style.border = '2px solid rgba(255,255,255,0.25)';
        dot.style.cursor = 'pointer';

        if (severity === 'low') dot.style.background = 'var(--color-success)';
        else if (severity === 'medium') dot.style.background = 'var(--color-warning)';
        else dot.style.background = 'var(--color-danger)';

        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            handleEarthquakeClick(eq);
        });

        
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleEarthquakeClick(eq);
            }
        });

        container.appendChild(dot);
    });
}

function startAutoRefresh() {
    if (APP_STATE.refreshInterval) return;
    APP_STATE.refreshInterval = setInterval(async () => {
        debugLog('Auto-refresh triggered');
        await loadInitialData();
        renderDashboard();
    }, UI_CONFIG.REFRESH_INTERVAL);

    debugLog('✅ Auto-refresh started');
}

function stopAutoRefresh() {
    if (!APP_STATE.refreshInterval) return;
    clearInterval(APP_STATE.refreshInterval);
    APP_STATE.refreshInterval = null;
    debugLog('⏸️ Auto-refresh stopped');
}

async function checkAPIsStatus() {
    try {
        const status = await checkAPIHealth();
        if (DOM.apiStatusUSGS) DOM.apiStatusUSGS.innerHTML = status.usgs ? '<i class="fas fa-check-circle"></i>Active' : '<i class="fas fa-times-circle"></i>Unavailable';
        if (DOM.apiStatusWeather) DOM.apiStatusWeather.innerHTML = status.weather ? '<i class="fas fa-check-circle"></i>Active' : '<i class="fas fa-times-circle"></i>Unavailable';

        if (!status.usgs || !status.weather) {
            showToast('Some data sources are unavailable. Using cached or limited data.', 'warning');
        }
    } catch (error) {
        debugError('API status check failed:', error);
    }
}

function checkForHighMagnitudeAlerts() {
    const high = APP_STATE.filteredEarthquakes.filter(eq => eq.properties.mag >= NOTIFICATION_CONFIG.MIN_MAGNITUDE);

    if (high.length > 0) {
        const peak = high.reduce((a, b) => (a.properties.mag > b.properties.mag ? a : b));

        if (DOM.alertBanner) {
            const msg = getElement('#alert-message');
            if (msg) msg.textContent = `Earthquake M${formatNumber(peak.properties.mag, 1)} detected near ${truncate(peak.properties.place, 60)}`;
            toggleElement(DOM.alertBanner, true);
        }

        
        if (('Notification' in window) && Notification.permission === 'granted') {
            const severity = getMagnitudeSeverity(peak.properties.mag);
            const title = NOTIFICATION_CONFIG.TITLES[severity] || 'Earthquake Alert';
            new Notification(title, {
                body: `M${formatNumber(peak.properties.mag, 1)} • ${truncate(peak.properties.place, 60)}`,
                icon: NOTIFICATION_CONFIG.ICON
            });
        }
    } else {
        if (DOM.alertBanner) toggleElement(DOM.alertBanner, false);
    }
}

function renderEarthquakeList() {
    if (!DOM.earthquakeList) return;

    debugLog(`🎨 Rendering ${APP_STATE.displayedEarthquakes.length} earthquakes...`);

    
    DOM.earthquakeList.innerHTML = '';
    
    
    if (APP_STATE.displayedEarthquakes.length === 0) {
        toggleElement(DOM.noResults, true);
        toggleElement(DOM.loadMoreBtn?.parentElement, false);
        
        
        if (DOM.resultsCount) {
            DOM.resultsCount.innerHTML = 'Showing <strong>0</strong> results';
        }
        return;
    }
    
    toggleElement(DOM.noResults, false);
    
    
    APP_STATE.displayedEarthquakes.forEach(earthquake => {
        const card = createEarthquakeCard(earthquake);
        DOM.earthquakeList.appendChild(card);
    });
    
    
    const hasMore = APP_STATE.displayedEarthquakes.length < APP_STATE.filteredEarthquakes.length;
    if (DOM.loadMoreBtn?.parentElement) {
        toggleElement(DOM.loadMoreBtn.parentElement, hasMore);
    }
    
    
    if (DOM.resultsCount) {
        DOM.resultsCount.innerHTML = `
            Showing <strong>${APP_STATE.displayedEarthquakes.length}</strong> 
            of <strong>${APP_STATE.filteredEarthquakes.length}</strong> results
        `;
    }
}


function createEarthquakeCard(earthquake) {
    const { properties, geometry, id } = earthquake;
    const magnitude = properties.mag;
    const place = properties.place;
    const time = properties.time;
    const depth = geometry.coordinates[2];
    const [lon, lat] = geometry.coordinates;
    
    
    const severity = getMagnitudeSeverity(magnitude);
    
    
    let distanceText = '';
    if (APP_STATE.location) {
        const distance = calculateDistance(
            APP_STATE.location.latitude,
            APP_STATE.location.longitude,
            lat,
            lon
        );
        distanceText = `${formatWithCommas(distance)} km away`;
    }
    
    
    const card = createElement('article', {
        class: `earthquake-card ${severity === 'low' ? 'magnitude-low' : severity === 'medium' ? 'magnitude-medium' : 'magnitude-high'}`,
        'data-id': id
    });
    
    card.innerHTML = `
        <div class="earthquake-card-header">
            <div class="earthquake-info">
                <span class="magnitude-badge ${severity === 'low' ? 'magnitude-low' : severity === 'medium' ? 'magnitude-medium' : 'magnitude-high'}">
                    <i class="fas fa-wave-square"></i>
                    M ${formatNumber(magnitude, 1)}
                </span>
                <h3 class="earthquake-location">${sanitizeHTML(place)}</h3>
                <span class="earthquake-time">
                    <i class="fas fa-clock"></i>
                    ${getTimeAgo(time)}
                </span>
            </div>
        </div>
        
        <div class="earthquake-details">
            <div class="earthquake-detail">
                <i class="fas fa-arrows-down-to-line"></i>
                <span>Depth: <strong>${formatNumber(depth, 1)} km</strong></span>
            </div>
            <div class="earthquake-detail">
                <i class="fas fa-location-dot"></i>
                <span>${formatCoordinates(lat, lon)}</span>
            </div>
            ${distanceText ? `
                <div class="earthquake-detail">
                    <i class="fas fa-route"></i>
                    <span>${distanceText}</span>
                </div>
            ` : ''}
            <div class="earthquake-detail">
                <i class="fas fa-calendar"></i>
                <span>${formatDate(time, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
    `;
    
    
    card.addEventListener('click', () => handleEarthquakeClick(earthquake));
    
    return card;
}


async function handleEarthquakeClick(earthquake) {
    debugLog('🔍 Earthquake clicked:', earthquake.id);

    const { properties, geometry, id } = earthquake;
    const [lon, lat, depth] = geometry.coordinates;

    if (!DOM.modalBody) return;

    
    openModal();
    DOM.modalBody.innerHTML = `<div class="modal-loading">Loading earthquake details...</div>`;

    try {
        
        const details = await fetchEarthquakeDetails(id).catch(() => null);
        const props = details?.properties || properties;

        
        DOM.modalBody.innerHTML = `
            <div class="modal-earthquake-details">
                <div class="detail-row">
                    <span class="detail-label">Magnitude</span>
                    <span class="detail-value">
                        <span class="magnitude-badge ${getMagnitudeSeverity(props.mag) === 'low' ? 'magnitude-low' : getMagnitudeSeverity(props.mag) === 'medium' ? 'magnitude-medium' : 'magnitude-high'}">
                            M ${formatNumber(props.mag, 1)}
                        </span>
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${sanitizeHTML(props.place)}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">${formatDate(props.time)}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Depth</span>
                    <span class="detail-value">${formatNumber(geometry.coordinates[2], 1)} km</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Coordinates</span>
                    <span class="detail-value">${formatCoordinates(geometry.coordinates[1], geometry.coordinates[0])}</span>
                </div>

                ${props.felt ? `
                    <div class="detail-row">
                        <span class="detail-label">Felt Reports</span>
                        <span class="detail-value">${props.felt} reports</span>
                    </div>
                ` : ''}

                ${props.tsunami ? `
                    <div class="detail-row">
                        <span class="detail-label">Tsunami</span>
                        <span class="detail-value">Alert level: ${props.tsunami}</span>
                    </div>
                ` : ''}

                <div class="detail-actions">
                    <a class="btn btn-primary" href="${sanitizeUrl(props.url)}" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i> View on USGS
                    </a>
                    <button class="btn btn-secondary" id="modal-show-on-map">
                        <i class="fas fa-map-marker-alt"></i> Show on Map
                    </button>
                </div>

                <div class="modal-footer">
                    <small class="text-muted">ID: ${id}</small>
                </div>
            </div>
        `;

        
        const showBtn = getElement('#modal-show-on-map');
        if (showBtn) {
            showBtn.addEventListener('click', () => {
                
                const mapBtn = DOM.viewBtns.find(b => b.dataset.view === 'map');
                if (mapBtn) mapBtn.click();

                
                renderMap();
                
                setTimeout(() => {
                    
                    const mapContainer = getElement('#earthquake-map');
                    const dot = mapContainer?.querySelector(`.map-dot[data-id="${id}"]`);
                    if (dot) {
                        dot.classList.add('pulse');
                        setTimeout(() => dot.classList.remove('pulse'), 2000);
                    }
                }, 300);
            });
        }

    } catch (error) {
        debugError('Failed to load earthquake details:', error);
        DOM.modalBody.innerHTML = `
            <div class="modal-error">Failed to load details. <button class="btn btn-secondary btn-small" id="modal-retry">Retry</button></div>
        `;

        const retryBtn = getElement('#modal-retry');
        if (retryBtn) retryBtn.addEventListener('click', () => handleEarthquakeClick(earthquake));
    }
}
