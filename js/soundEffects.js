/**
 * Sound Effects Manager for Cockroach Run
 * Handles button click sounds and other UI audio feedback
 */

// Initialize sound effects
const initSoundEffects = () => {
    // Use the existing button click audio element
    const buttonClickSound = document.getElementById('button-click');
    if (!buttonClickSound) {
        console.warn('Button click sound element not found');
        return;
    }
    
    buttonClickSound.volume = 0.5; // Set volume to 50%
    
    // Function to play button sound
    const playButtonSound = () => {
        // Reset the audio to start position and play
        buttonClickSound.currentTime = 0;
        buttonClickSound.play().catch(err => console.warn("Sound playback error:", err));
    };
    
    // Add click sound to all interactive elements
    const selectors = [
        '.menu-button', 
        '.start-button',
        '.back-button',
        '.save-button',
        '.mode-card',
        '.character-card:not(.locked)',
        '.option-button',
        '.toggle',
        '.pause-button'
    ];
    
    // Apply to all matched elements
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('click', playButtonSound);
            // Add visual feedback for debugging
            element.classList.add('sound-enabled');
        });
        console.log(`Added sound to ${elements.length} ${selector} elements`);
    });
    
    console.log('Sound effects initialized');
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initSoundEffects);
