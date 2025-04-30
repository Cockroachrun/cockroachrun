// Zoom handler for Cockroach Run
// This script adds proper zoom handling to the game

(function() {
  console.log("Zoom handler initialized");
  
  // Wait for game to initialize
  const checkGameReady = setInterval(() => {
    // Check if we're in the iframe (child window)
    if (window.parent !== window) {
      console.log("Running in iframe, setting up zoom message handler");
      
      // Set up message listener to receive zoom commands from parent
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'zoom') {
          console.log("Received zoom message:", event.data);
          
          // Find game instance and access the active game mode
          if (window.game && window.game.activeGameMode) {
            const gameMode = window.game.activeGameMode;
            
            // Apply zoom
            if (typeof gameMode.zoomLevel !== 'undefined') {
              // Get delta from message
              const zoomDelta = event.data.delta * gameMode.zoomSpeed;
              
              // Update zoom level
              gameMode.zoomLevel += zoomDelta;
              
              // Clamp zoom level
              gameMode.zoomLevel = Math.max(
                gameMode.minZoom || 1.5, 
                Math.min(gameMode.maxZoom || 15, gameMode.zoomLevel)
              );
              
              console.log("Zoom level updated to:", gameMode.zoomLevel);
            }
          }
        }
      });
      
      // Also set up button handlers
      setupZoomButtons();
      
      // Add direct wheel listener
      setupDirectWheelHandler();
      
      clearInterval(checkGameReady);
    }
  }, 500);
  
  // Set up zoom buttons in iframe
  function setupZoomButtons() {
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    
    if (zoomInButton && zoomOutButton) {
      console.log("Setting up zoom buttons");
      
      zoomInButton.addEventListener('click', () => {
        if (window.game && window.game.activeGameMode) {
          const gameMode = window.game.activeGameMode;
          if (typeof gameMode.zoomLevel !== 'undefined') {
            // Zoom in (negative delta means zoom in)
            gameMode.zoomLevel -= gameMode.zoomSpeed * 2;
            gameMode.zoomLevel = Math.max(
              gameMode.minZoom || 1.5, 
              Math.min(gameMode.maxZoom || 15, gameMode.zoomLevel)
            );
            console.log("Zoom in button clicked, new level:", gameMode.zoomLevel);
          }
        }
      });
      
      zoomOutButton.addEventListener('click', () => {
        if (window.game && window.game.activeGameMode) {
          const gameMode = window.game.activeGameMode;
          if (typeof gameMode.zoomLevel !== 'undefined') {
            // Zoom out (positive delta means zoom out)
            gameMode.zoomLevel += gameMode.zoomSpeed * 2;
            gameMode.zoomLevel = Math.max(
              gameMode.minZoom || 1.5, 
              Math.min(gameMode.maxZoom || 15, gameMode.zoomLevel)
            );
            console.log("Zoom out button clicked, new level:", gameMode.zoomLevel);
          }
        }
      });
    }
  }
  
  // Set up direct wheel handler in iframe as backup
  function setupDirectWheelHandler() {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      console.log("Adding backup wheel handler to iframe container");
      
      gameContainer.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        if (window.game && window.game.activeGameMode) {
          const gameMode = window.game.activeGameMode;
          if (typeof gameMode.zoomLevel !== 'undefined') {
            // Calculate zoom direction (wheel up = zoom in, wheel down = zoom out)
            const zoomFactor = event.deltaY > 0 ? 1 : -1;
            const zoomDelta = zoomFactor * gameMode.zoomSpeed;
            
            // Update zoom level
            gameMode.zoomLevel += zoomDelta;
            
            // Clamp zoom level
            gameMode.zoomLevel = Math.max(
              gameMode.minZoom || 1.5, 
              Math.min(gameMode.maxZoom || 15, gameMode.zoomLevel)
            );
            
            console.log("Direct wheel zoom, new level:", gameMode.zoomLevel);
          }
        }
      }, { passive: false });
    }
  }
})();
