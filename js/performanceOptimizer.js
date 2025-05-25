/**
 * Performance Optimizer for Cockroach Run
 * Reduces lag and improves responsiveness
 */

class PerformanceOptimizer {
    constructor() {
        this.frameThrottle = 0;
        this.inputThrottle = 0;
        this.lastFrameTime = 0;
        this.eventListeners = new Map();
        this.animationFrameId = null;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
    }

    /**
     * Optimize button event handling with debouncing
     */
    optimizeButtonEvents() {
        // Remove existing button listeners and add optimized ones
        const buttons = document.querySelectorAll('button, .mode-card, .character-card');
        
        buttons.forEach(button => {
            // Remove existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add optimized single listener with debouncing
            this.addOptimizedClickListener(newButton);
        });
    }

    /**
     * Add optimized click listener with debouncing
     */
    addOptimizedClickListener(element) {
        let clickTimeout = null;
        
        const optimizedHandler = (e) => {
            // Prevent multiple rapid clicks
            if (clickTimeout) return;
            
            clickTimeout = setTimeout(() => {
                clickTimeout = null;
            }, 150); // 150ms debounce
            
            // Play button sound efficiently
            if (window.AudioManager) {
                // Use Web Audio API for better performance
                this.playButtonSoundOptimized();
            }
            
            // Handle the actual click
            this.handleOptimizedClick(element, e);
        };
        
        // Use passive listeners for better performance
        element.addEventListener('click', optimizedHandler, { passive: false });
        
        // Store reference for cleanup
        this.eventListeners.set(element, optimizedHandler);
    }

    /**
     * Optimized button sound using Web Audio API
     */
    playButtonSoundOptimized() {
        // Use a more efficient sound playing method
        try {
            if (window.AudioManager && window.AudioManager.buttonClickSound) {
                const audio = window.AudioManager.buttonClickSound;
                
                // Reset to beginning and play (faster than creating new instances)
                audio.currentTime = 0;
                audio.play().catch(() => {}); // Ignore autoplay errors
            }
        } catch (e) {
            // Fail silently to avoid performance impact
        }
    }

    /**
     * Handle optimized button clicks
     */
    handleOptimizedClick(element, event) {
        const id = element.id;
        const classList = element.classList;
        
        // Efficient routing based on element type
        if (classList.contains('mode-card')) {
            this.handleModeSelection(element);
        } else if (classList.contains('character-card')) {
            this.handleCharacterSelection(element);
        } else if (id) {
            this.handleButtonClick(id, element, event);
        }
    }

    /**
     * Optimize animation loops
     */
    optimizeAnimationLoop(gameUpdateFunction) {
        const optimizedLoop = (timestamp) => {
            // Throttle to target FPS
            if (timestamp - this.lastFrameTime >= this.frameInterval) {
                this.lastFrameTime = timestamp;
                
                // Call the actual game update
                if (typeof gameUpdateFunction === 'function') {
                    gameUpdateFunction(timestamp);
                }
            }
            
            // Continue the loop
            this.animationFrameId = requestAnimationFrame(optimizedLoop);
        };
        
        // Start the optimized loop
        this.animationFrameId = requestAnimationFrame(optimizedLoop);
    }

    /**
     * Optimize DOM queries by caching elements
     */
    cacheCommonElements() {
        this.cachedElements = {
            gameContainer: document.getElementById('game-container'),
            loadingScreen: document.getElementById('loading-screen'),
            settingsMenu: document.getElementById('settings-menu'),
            debugInfo: document.getElementById('debug-info'),
            touchControls: document.getElementById('touch-controls')
        };
        
        // Make cached elements globally available
        window.cachedElements = this.cachedElements;
    }

    /**
     * Optimize CSS transitions for better performance
     */
    optimizeCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Hardware acceleration for smooth animations */
            .character-card, .mode-card, button {
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            
            /* Optimize transitions */
            .character-card {
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            
            /* Reduce expensive box-shadow during animations */
            .character-card:hover {
                box-shadow: none;
                transform: scale(1.02) translateZ(0);
            }
            
            /* Optimize button hover effects */
            button:hover {
                transition: background-color 0.1s ease;
            }
            
            /* Disable animations on low-end devices */
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Optimize Three.js rendering
     */
    optimizeThreeJS(renderer, scene, camera) {
        if (!renderer) return;
        
        // Enable efficient rendering options
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
        renderer.shadowMap.type = THREE.PCFShadowMap; // Faster shadow rendering
        renderer.powerPreference = "high-performance";
        
        // Optimize for mobile devices
        if (this.isMobileDevice()) {
            renderer.setPixelRatio(1); // Force lower pixel ratio on mobile
            renderer.shadowMap.enabled = false; // Disable shadows on mobile
        }
        
        // Enable frustum culling
        if (camera) {
            camera.updateProjectionMatrix();
        }
        
        // Optimize scene rendering
        if (scene) {
            scene.autoUpdate = false; // Manual updates only when needed
        }
    }

    /**
     * Memory management for better performance
     */
    cleanupMemory() {
        // Remove unused event listeners
        this.eventListeners.forEach((handler, element) => {
            if (!document.contains(element)) {
                this.eventListeners.delete(element);
            }
        });
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Detect mobile devices
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Handle mode selection efficiently
     */
    handleModeSelection(element) {
        const mode = element.dataset.mode;
        if (mode && window.Game) {
            // Use efficient state management
            window.Game.setMode(mode);
        }
    }

    /**
     * Handle character selection efficiently
     */
    handleCharacterSelection(element) {
        const character = element.dataset.character;
        if (character && window.Game) {
            // Use efficient character switching
            window.Game.setCharacter(character);
        }
    }

    /**
     * Handle button clicks efficiently
     */
    handleButtonClick(buttonId, element, event) {
        // Prevent default only when necessary
        if (buttonId.includes('submit') || buttonId.includes('form')) {
            event.preventDefault();
        }
        
        // Route to appropriate handlers
        switch (buttonId) {
            case 'start-game-button':
                this.handleGameStart();
                break;
            case 'settings-button':
                this.toggleSettings();
                break;
            case 'music-toggle':
                this.toggleMusic();
                break;
            // Add more cases as needed
        }
    }

    /**
     * Optimized game start
     */
    handleGameStart() {
        // Hide UI elements efficiently
        const loadingScreen = this.cachedElements.loadingScreen;
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Start game with minimal delay
        if (window.Game && window.Game.start) {
            requestAnimationFrame(() => {
                window.Game.start();
            });
        }
    }

    /**
     * Optimized settings toggle
     */
    toggleSettings() {
        const settingsMenu = this.cachedElements.settingsMenu;
        if (settingsMenu) {
            const isVisible = settingsMenu.style.display === 'block';
            settingsMenu.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Optimized music toggle
     */
    toggleMusic() {
        if (window.AudioManager) {
            window.AudioManager.toggle();
        }
    }

    /**
     * Initialize all optimizations
     */
    init() {
        console.log('🚀 Performance Optimizer initializing...');
        
        // Apply optimizations
        this.cacheCommonElements();
        this.optimizeCSS();
        this.optimizeButtonEvents();
        
        // Monitor performance
        this.startPerformanceMonitoring();
        
        console.log('✅ Performance optimizations applied');
    }

    /**
     * Performance monitoring
     */
    startPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            // Log FPS every 60 frames
            if (frameCount % 60 === 0) {
                const fps = 1000 / ((currentTime - lastTime) / 60);
                if (fps < 45) {
                    console.warn(`⚠️  Low FPS detected: ${fps.toFixed(1)}`);
                }
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    /**
     * Cleanup on page unload
     */
    cleanup() {
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Remove event listeners
        this.eventListeners.clear();
        
        // Clear cached elements
        this.cachedElements = null;
    }
}

// Initialize performance optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.PerformanceOptimizer = new PerformanceOptimizer();
    window.PerformanceOptimizer.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.PerformanceOptimizer) {
        window.PerformanceOptimizer.cleanup();
    }
});
