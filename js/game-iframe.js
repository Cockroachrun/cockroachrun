/**
 * Cockroach Run - Game Engine (iframe integration)
 * Using the working test page in an iframe to guarantee functionality
 */

window.Game = (function() {
    // Track the iframe
    let gameIframe = null;
    let isRunning = false;
    
    // Public API
    return {
        startGame: function(mode, character) {
            console.log("Starting game with mode:", mode || "free-world", "and character:", character || "american");
            
            try {
                // Get the game container
                const gameContainer = document.getElementById('game-container');
                if (!gameContainer) {
                    console.error("Game container not found!");
                    return;
                }
                
                // Make container visible
                gameContainer.style.display = 'block';
                gameContainer.style.position = 'fixed';
                gameContainer.style.top = '0';
                gameContainer.style.left = '0';
                gameContainer.style.width = '100%';
                gameContainer.style.height = '100%';
                gameContainer.style.zIndex = '100';
                
                // Check if iframe exists, create if not
                if (!gameIframe) {
                    gameIframe = document.createElement('iframe');
                    gameIframe.id = 'game-iframe';
                    gameIframe.style.width = '100%';
                    gameIframe.style.height = '100%';
                    gameIframe.style.border = 'none';
                    gameIframe.allowFullscreen = true;
                    
                    // Add mode and character as query params
                    const params = new URLSearchParams();
                    if (mode) params.append('mode', mode);
                    if (character) params.append('character', character);
                    
                    // Set source to the working test page
                    gameIframe.src = 'test-free-world-simple.html?' + params.toString();
                    
                    // Add message event listener to communicate with iframe
                    window.addEventListener('message', function(event) {
                        // Handle messages from the iframe
                        if (event.data && event.data.type) {
                            switch(event.data.type) {
                                case 'game-loaded':
                                    console.log("Game loaded in iframe");
                                    break;
                                case 'game-ended':
                                    // Handle game end
                                    this.stopGame();
                                    break;
                            }
                        }
                    }.bind(this));
                    
                    // Append iframe to container
                    gameContainer.appendChild(gameIframe);
                }
                
                isRunning = true;
            } catch (error) {
                console.error("Error starting game:", error);
            }
        },
        
        pauseGame: function() {
            console.log("Pausing game");
            isRunning = false;
            if (gameIframe && gameIframe.contentWindow) {
                gameIframe.contentWindow.postMessage({ action: 'pause' }, '*');
            }
        },
        
        resumeGame: function() {
            console.log("Resuming game");
            isRunning = true;
            if (gameIframe && gameIframe.contentWindow) {
                gameIframe.contentWindow.postMessage({ action: 'resume' }, '*');
            }
        },
        
        stopGame: function() {
            console.log("Stopping game");
            isRunning = false;
            
            // Remove iframe from container
            if (gameIframe && gameIframe.parentNode) {
                gameIframe.parentNode.removeChild(gameIframe);
                gameIframe = null;
            }
            
            // Hide game container
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.display = 'none';
            }
        }
    };
})();

console.log("Game iframe engine loaded");
