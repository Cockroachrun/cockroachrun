/**
 * Sound Effects Manager for Cockroach Run
 * Handles button click sounds and other UI audio feedback
 */

// Use existing audio element if available, otherwise create a new one
let buttonClickSound;

/**
 * Play button click sound
 */
function playButtonSound() {
    try {
        // Try to use existing audio element if available
        const soundElement = document.getElementById('button-click') || buttonClickSound;
        
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(err => console.warn("Sound playback error:", err));
        }
    } catch (err) {
        console.warn("Error playing sound:", err);
    }
}

/**
 * Add sound effects to all interactive elements
 */
function initSoundEffects() {
    console.log('Initializing sound effects');
    
    try {
        // Check for existing audio element first
        buttonClickSound = document.getElementById('button-click');
        
        // If no existing element, create one
        if (!buttonClickSound) {
            buttonClickSound = new Audio('sounds/ui_button_click.mp3');
            buttonClickSound.id = 'button-click';
            buttonClickSound.volume = 0.5;
            document.body.appendChild(buttonClickSound);
        }
        
        // All interactive elements that should have click sounds
        const selectors = [
            '.button', 
            '[id*="button"]', 
            '.nav-button', 
            '.mode-card',
            '.back-button', 
            '.start-button',
            '#back-from-character',
            '#start-game-button',
            '.menu-button',
            '.save-button',
            '.character-card:not(.locked)',
            '.option-button',
            '.toggle',
            '.pause-button'
        ];
        
        // Apply click sound to all matched elements
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Add sound effect
                element.addEventListener('click', playButtonSound);
                element.addEventListener('touchend', playButtonSound);
                
                // Add visual feedback for debugging
                element.classList.add('sound-enabled');
            });
            console.log(`Added sound to ${elements.length} ${selector} elements`);
        });
        
        // Special handling for the character carousel buttons
        document.addEventListener('click', function(e) {
            // Handle any button click, regardless of when it was added to the DOM
            if (e.target.classList.contains('back-button') || 
                e.target.classList.contains('start-button') ||
                e.target.id === 'back-from-character' ||
                e.target.id === 'start-game-button') {
                playButtonSound();
            }
        }, true); // Use capture phase to ensure this runs first
                
        console.log('Sound effects initialized successfully');
    } catch (error) {
        console.warn('Error initializing sound effects:', error);
    }
}

// Initialize both on DOMContentLoaded AND right now (in case DOM is already loaded)
document.addEventListener('DOMContentLoaded', initSoundEffects);

// Also run now (safely) if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initSoundEffects, 100); // Small delay to ensure proper execution
}
