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
                
                // Clear any existing content in the game container
                while (gameContainer.firstChild) {
                    gameContainer.removeChild(gameContainer.firstChild);
                }
                
                // Hide any potential 2D elements that might be visible
                const gameCanvas = document.getElementById('game-canvas');
                if (gameCanvas && gameCanvas.parentNode !== gameContainer) {
                    gameCanvas.style.display = 'none';
                }
                
                // Make container visible with proper styling
                gameContainer.style.display = 'block';
                gameContainer.style.position = 'fixed';
                gameContainer.style.top = '0';
                gameContainer.style.left = '0';
                gameContainer.style.width = '100%';
                gameContainer.style.height = '100%';
                gameContainer.style.zIndex = '100';
                
                // Remove any existing iframe
                if (gameIframe) {
                    if (gameIframe.parentNode) {
                        gameIframe.parentNode.removeChild(gameIframe);
                    }
                    gameIframe = null;
                }
                
                // Create new iframe
                gameIframe = document.createElement('iframe');
                gameIframe.id = 'game-iframe';
                gameIframe.style.width = '100%';
                gameIframe.style.height = '100%';
                gameIframe.style.border = 'none';
                gameIframe.style.zIndex = '10';
                gameIframe.allowFullscreen = true;
                
                // Add mode and character as query params
                const params = new URLSearchParams();
                if (mode) params.append('mode', mode);
                if (character) params.append('character', character);
                
                // Set source to the ultimate test page with advanced model loading and debugging
                gameIframe.src = 'test-ultimate.html?' + params.toString();
                
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
                
                // Add click handler to focus the iframe
                gameContainer.addEventListener('click', function() {
                    if (gameIframe) {
                        gameIframe.focus();
                    }
                });
                
                // IMPROVED: Add wheel event listener to container to forward zoom to iframe
                gameContainer.addEventListener('wheel', function(event) {
                    if (gameIframe && gameIframe.contentWindow) {
                        event.preventDefault(); // Prevent parent page scrolling
                        
                        // Forward normalized wheel delta to iframe
                        const delta = event.deltaY > 0 ? 1 : -1; // Normalize to 1 or -1 for consistent zoom speed
                        console.log("ZOOM: Parent sending zoom delta:", delta);
                        
                        gameIframe.contentWindow.postMessage({
                            type: 'zoom',
                            delta: delta
                        }, '*'); // Send to any origin within the iframe
                    }
                    return false;
                }, { passive: false }); // Use passive: false to allow preventDefault
                
                // Focus iframe after a short delay to ensure it's rendered
                setTimeout(function() {
                    if (gameIframe) {
                        gameIframe.focus();
                        
                        // Also try to focus via postMessage
                        if (gameIframe.contentWindow) {
                            gameIframe.contentWindow.postMessage({ action: 'focus' }, '*');
                            
                            // Force a control keypress to get focus
                            gameIframe.contentWindow.postMessage({ 
                                action: 'keypress',
                                key: 'test'
                            }, '*');
                        }
                    }
                }, 1000);
                
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
        },
        
        // Function to return to main menu - can be called from iframe
        returnToMenu: function() {
            console.log("Returning to main menu from game");
            
            try {
                // First stop the game properly
                this.stopGame();
                
                // Reset game state completely
                isRunning = false;
                gameIframe = null;
                
                // Make sure game container is hidden
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.innerHTML = '';
                    gameContainer.style.display = 'none';
                }
                
                // Then return to start screen
                if (window.UIManager) {
                    console.log("Showing start screen");
                    window.UIManager.showScreen('start');
                } else {
                    console.error("UIManager not found");
                    // Force reload as last resort
                    window.location.reload();
                }
            } catch (e) {
                console.error("Error returning to menu:", e);
                // Force reload as last resort
                window.location.reload();
            }
        }
    };
})();

console.log("Game iframe engine loaded");
