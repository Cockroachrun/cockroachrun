// loading.js - Dedicated loading screen handler

// Self-contained loading manager
const LoadingManager = {
    // Elements
    screen: null,
    bar: null, 
    percentageText: null,
    messageText: null,
    
    // State
    isLoaded: false,
    progress: 0,
    
    // Messages to cycle through
    messages: [
        'Preparing for infestation...',
        'Polishing antennae...',
        'Triggering human disgust reactions...',
        'Calculating escape routes...',
        'Analyzing kitchen layouts...',
        'Optimizing scurrying algorithms...',
        'Synchronizing survival instincts...',
        'Calibrating night vision...',
        'Brewing fear responses...'
    ],
    
    // Initialize loading screen
    init() {
        // Get references to elements
        this.screen = document.getElementById('loading-screen');
        this.bar = document.getElementById('loading-bar');
        this.percentageText = document.getElementById('loading-percentage-value');
        this.messageText = document.getElementById('loading-message');
        
        // Ensure we have all elements
        if (!this.screen || !this.bar || !this.percentageText || !this.messageText) {
            console.error('Loading screen elements not found!');
            this.forceComplete();
            return;
        }
        
        // Start the loading animation
        this.startLoadingAnimation();
        
        // Cycle through messages
        this.startMessageCycle();
        
        // Failsafe in case loading takes too long
        this.setupFailsafe();
        
        console.log('Loading screen initialized');
    },
    
    // Start loading bar animation
    startLoadingAnimation() {
        const interval = setInterval(() => {
            // Update progress
            this.progress += 2;
            
            // Update UI
            if (this.bar) this.bar.style.width = `${this.progress}%`;
            if (this.percentageText) this.percentageText.textContent = this.progress;
            
            // Check if complete
            if (this.progress >= 100) {
                clearInterval(interval);
                
                // Complete loading after a short delay
                setTimeout(() => this.completeLoading(), 500);
            }
        }, 30);
    },
    
    // Cycle through loading messages
    startMessageCycle() {
        let messageIndex = 0;
        
        const interval = setInterval(() => {
            if (this.isLoaded) {
                clearInterval(interval);
                return;
            }
            
            messageIndex = (messageIndex + 1) % this.messages.length;
            if (this.messageText) {
                this.messageText.textContent = this.messages[messageIndex];
            }
        }, 3000);
    },
    
    // Set up failsafe in case loading hangs
    setupFailsafe() {
        setTimeout(() => {
            if (!this.isLoaded) {
                console.warn('Loading failsafe triggered!');
                this.forceComplete();
            }
        }, 15000); // 15 second failsafe
    },
    
    // Complete loading and transition to start screen
    completeLoading() {
        if (this.isLoaded) return; // Prevent multiple calls
        
        this.isLoaded = true;
        console.log('Loading complete, showing start screen');
        
        // Hide loading screen with definitive approach
        if (this.screen) {
            this.screen.classList.add('inactive');
            this.screen.style.display = 'none';
        }
        
        // Show start screen - find it by ID or class
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.classList.add('active');
        }
        
        // Try to play menu music
        this.tryPlayMusic();
        
        // Dispatch event for other components to listen for
        document.dispatchEvent(new CustomEvent('loadingComplete'));
    },
    
    // Force complete loading (failsafe)
    forceComplete() {
        this.progress = 100;
        if (this.bar) this.bar.style.width = '100%';
        if (this.percentageText) this.percentageText.textContent = '100';
        this.completeLoading();
    },
    
    // Try to play menu music
    tryPlayMusic() {
        const menuMusic = document.getElementById('menu-music');
        if (!menuMusic) return;
        
        menuMusic.volume = 0.8; // Set initial volume
        
        // Try to play music
        menuMusic.play().catch(error => {
            console.warn('Autoplay prevented by browser:', error);
            
            // Set up click handler to play music on first interaction
            document.addEventListener('click', function playMusicOnClick() {
                menuMusic.play().catch(e => console.warn('Failed to play music on click:', e));
                document.removeEventListener('click', playMusicOnClick);
            }, { once: true });
        });
    }
};

// Initialize loading screen immediately
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading screen
    LoadingManager.init();
});