/**
 * Cockroach Run - Utility Functions
 * General helper functions used throughout the codebase
 */

const Utils = {
    /**
     * Generate a random number between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number between min and max
     */
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer between min and max
     */
    randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Linear interpolation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    },
    
    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    
    /**
     * Calculate distance between two points in 2D
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} Distance between points
     */
    distance2D(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    /**
     * Calculate distance between two points in 3D
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} z1 - Z coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @param {number} z2 - Z coordinate of second point
     * @returns {number} Distance between points
     */
    distance3D(x1, y1, z1, x2, y2, z2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
    },
    
    /**
     * Format time in seconds to MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string (MM:SS)
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Format a score with thousands separators
     * @param {number} score - Score to format
     * @returns {string} Formatted score
     */
    formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    /**
     * Store data in localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @returns {boolean} Success status
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },
    
    /**
     * Retrieve data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Retrieved data or defaultValue
     */
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Detect if the user is on a mobile device
     * @returns {boolean} True if on mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0);
    },
    
    /**
     * Get URL parameter value
     * @param {string} name - Parameter name
     * @returns {string|null} Parameter value or null if not found
     */
    getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },
    
    /**
     * Log a message with timestamp and type
     * @param {string} message - Message to log
     * @param {string} type - Log type (INFO, WARN, ERROR, DEBUG)
     */
    log(message, type = 'INFO') {
        if (!CONFIG.DEBUG.ENABLED && type === 'DEBUG') return;
        
        const logLevels = {
            'ERROR': 0,
            'WARN': 1,
            'INFO': 2,
            'DEBUG': 3
        };
        
        const configLogLevel = logLevels[CONFIG.DEBUG.LOG_LEVEL] || 2;
        if (logLevels[type] > configLogLevel) return;
        
        const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
        
        switch (type) {
            case 'ERROR':
                console.error(`[${timestamp}] ERROR: ${message}`);
                break;
            case 'WARN':
                console.warn(`[${timestamp}] WARN: ${message}`);
                break;
            case 'DEBUG':
                console.debug(`[${timestamp}] DEBUG: ${message}`);
                break;
            default:
                console.log(`[${timestamp}] INFO: ${message}`);
        }
    },
    
    /**
     * Calculate FPS (frames per second)
     * @param {number} deltaTime - Time since last frame in seconds
     * @returns {number} Current FPS
     */
    calculateFPS(deltaTime) {
        return Math.round(1 / deltaTime);
    },
    
    /**
     * Throttle a function to run at most once every `limit` milliseconds
     * @param {Function} callback - Function to throttle
     * @param {number} limit - Minimum time between calls (ms)
     * @returns {Function} Throttled function
     */
    throttle(callback, limit) {
        let waiting = false;
        return function() {
            if (!waiting) {
                callback.apply(this, arguments);
                waiting = true;
                setTimeout(() => {
                    waiting = false;
                }, limit);
            }
        };
    },
    
    /**
     * Debounce a function to run only after `delay` milliseconds have elapsed
     * since it was last called
     * @param {Function} callback - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(callback, delay) {
        let timeoutId;
        return function() {
            const args = arguments;
            const context = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback.apply(context, args);
            }, delay);
        };
    }
}; 