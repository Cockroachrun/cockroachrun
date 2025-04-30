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
                
                // Show a message about focusing
                const focusMessage = document.createElement('div');
                focusMessage.style.position = 'absolute';
                focusMessage.style.bottom = '10px';
                focusMessage.style.right = '10px';
                focusMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                focusMessage.style.color = '#00FF66';
                focusMessage.style.padding = '10px';
                focusMessage.style.borderRadius = '5px';
                focusMessage.style.fontFamily = 'monospace';
                focusMessage.style.zIndex = '1000';
                focusMessage.textContent = 'Click in the game area to enable controls';
                focusMessage.style.transition = 'opacity 0.5s';
                gameContainer.appendChild(focusMessage);
                
                // Hide message after 5 seconds
                setTimeout(function() {
                    focusMessage.style.opacity = '0';
                    // Remove after fade out
                    setTimeout(function() {
                        if (focusMessage.parentNode) {
                            focusMessage.parentNode.removeChild(focusMessage);
                        }
                    }, 500);
                }, 5000);
                
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
        }
    };
})();

console.log("Game iframe engine loaded");
