




function getTimeAgo(timestamp) {
    
    const now = Date.now();
    const diff = now - timestamp;
    
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    
    
    return new Date(timestamp).toLocaleDateString();
}


function formatDate(date, options = {}) {
    
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    
    
    const finalOptions = { ...defaultOptions, ...options };
    
    
    return new Intl.DateTimeFormat('en-US', finalOptions).format(dateObj);
}


function getISODate(date = new Date()) {
    return date.toISOString().split('T')[0];
}


function isWithinLastHours(timestamp, hours) {
    const now = Date.now();
    const hoursInMs = hours * 60 * 60 * 1000;
    return (now - timestamp) <= hoursInMs;
}




function formatNumber(num, decimals = 1) {
    
    if (num === null || num === undefined || isNaN(num)) {
        return '--';
    }
    return Number(num).toFixed(decimals);
}


function formatCoordinates(lat, lon) {
    
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    
    const latAbs = Math.abs(lat);
    const lonAbs = Math.abs(lon);
    
    return `${latAbs.toFixed(2)}°${latDir}, ${lonAbs.toFixed(2)}°${lonDir}`;
}


function formatWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance);
}


function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}




function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class') {
            element.className = value;
        } else if (key === 'dataset') {
            
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    
    if (typeof content === 'string') {
        element.textContent = content;
    } else if (content instanceof HTMLElement) {
        element.appendChild(content);
    }
    
    return element;
}


function getElement(selector, parent = document) {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        debugError(`Invalid selector: ${selector}`, error);
        return null;
    }
}


function getElements(selector, parent = document) {
    try {
        
        return Array.from(parent.querySelectorAll(selector));
    } catch (error) {
        debugError(`Invalid selector: ${selector}`, error);
        return [];
    }
}


function toggleElement(element, show) {
    if (!element) return;
    
    if (show) {
        element.classList.remove('hidden');
        
        void element.offsetWidth;
        element.classList.add('fade-in');
    } else {
        element.classList.add('fade-out');
        
        setTimeout(() => {
            element.classList.add('hidden');
            element.classList.remove('fade-in', 'fade-out');
        }, 300);
    }
}


function scrollToElement(target, offset = 80) {
    const element = typeof target === 'string' ? getElement(target) : target;
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}


function isInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}




function saveToStorage(key, value) {
    try {
        
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        debugLog(`💾 Saved to storage: ${key}`);
        return true;
    } catch (error) {
        
        
        
        debugError('Failed to save to storage:', error);
        return false;
    }
}


function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        
        
        if (item === null) {
            return defaultValue;
        }
        
        
        return JSON.parse(item);
    } catch (error) {
        debugError('Failed to get from storage:', error);
        return defaultValue;
    }
}


function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        debugLog(`🗑️ Removed from storage: ${key}`);
        return true;
    } catch (error) {
        debugError('Failed to remove from storage:', error);
        return false;
    }
}


function clearAppStorage() {
    try {
        
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        debugLog('🧹 Cleared all app storage');
        return true;
    } catch (error) {
        debugError('Failed to clear storage:', error);
        return false;
    }
}




function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}


function isValidCoordinates(lat, lon) {
    return (
        isValidNumber(lat) && 
        isValidNumber(lon) &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180
    );
}


function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}


function sanitizeUrl(url) {
    try {
        if (!url) return '#';
        
        const u = new URL(url, location.origin);
        if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
    } catch (e) {
        
    }
    return '#';
} 


function isValidEmail(email) {
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}




function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        
        const context = this;
        
        
        clearTimeout(timeout);
        
        
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}


function throttle(func, limit = 100) {
    let inThrottle;
    
    return function executedFunction(...args) {
        const context = this;
        
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function truncate(str, maxLength = 50) {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}


function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') 
        .replace(/\s+/g, '-')      
        .replace(/--+/g, '-')      
        .trim();
}


function generateId(length = 8) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}




function showToast(message, type = 'info', duration = UI_CONFIG.TOAST_DURATION) {
    
    const container = getElement('#toast-container');
    if (!container) {
        debugError('Toast container not found');
        return;
    }
    
    
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        info: 'fa-circle-info',
        warning: 'fa-triangle-exclamation'
    };
    
    
    const toast = createElement('div', {
        class: `toast toast-${type}`
    });
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${sanitizeHTML(message)}</span>
    `;
    
    
    container.appendChild(toast);
    
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    debugLog(`📢 Toast: ${message} (${type})`);
}




function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        
        const aValue = key.split('.').reduce((obj, k) => obj?.[k], a);
        const bValue = key.split('.').reduce((obj, k) => obj?.[k], b);
        
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
    });
}


function unique(array, key = null) {
    if (!key) {
        
        return [...new Set(array)];
    }
    
    
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}


function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}




function getUserLocation(options = {}) {
    return new Promise((resolve, reject) => {
        
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                
                
                
                
                reject(error);
            },
            finalOptions
        );
    });
}



debugLog('✅ Utilities loaded successfully');
debugLog(`📦 Available utilities: 
    - Time: getTimeAgo, formatDate, isWithinLastHours
    - Numbers: formatNumber, formatCoordinates, calculateDistance
    - DOM: createElement, getElement, toggleElement
    - Storage: saveToStorage, getFromStorage
    - Performance: debounce, throttle
    - And more...`);
