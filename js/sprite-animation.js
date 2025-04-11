/**
 * Cockroach Run - Sprite Animation
 * Handles the animated cockroach sprite on the main menu
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing sprite animation');
    
    // Animation settings
    const frames = [
        'assets/images/animations/frames/Cockroach_01.png',
        'assets/images/animations/frames/Cockroach_02.png',
        'assets/images/animations/frames/Cockroach_03.png',
        'assets/images/animations/frames/Cockroach_04.png',
        'assets/images/animations/frames/Cockroach_05.png',
        'assets/images/animations/frames/Cockroach_06.png',
        'assets/images/animations/frames/Cockroach_07.png',
        'assets/images/animations/frames/Cockroach_08.png',
        'assets/images/animations/frames/Cockroach_09.png'
    ];
    
    let currentFrame = 0;
    let animationInterval = null;
    const frameDelay = 100; // ms between frames
    
    // Get the sprite element
    const sprite = document.getElementById('cockroach-sprite');
    
    // Function to preload images
    function preloadImages() {
        frames.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Function to update the current frame
    function updateFrame() {
        if (sprite) {
            sprite.style.backgroundImage = `url('${frames[currentFrame]}')`;
        }
    }
    
    // Function to start the animation
    function startAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        
        currentFrame = 0;
        updateFrame();
        
        animationInterval = setInterval(() => {
            currentFrame = (currentFrame + 1) % frames.length;
            updateFrame();
        }, frameDelay);
    }
    
    // Check if sprite element exists
    if (sprite) {
        // Preload images
        preloadImages();
        
        // Start animation when the element is available
        if (document.getElementById('start-screen').classList.contains('active')) {
            // If start screen is already active
            startAnimation();
        } else {
            // Check periodically if start screen becomes active
            const checkInterval = setInterval(() => {
                if (document.getElementById('start-screen').classList.contains('active')) {
                    startAnimation();
                    clearInterval(checkInterval);
                }
            }, 500);
        }
    } else {
        console.error('Cockroach sprite element not found');
    }
});
