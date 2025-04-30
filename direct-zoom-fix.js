// Simple direct zoom fix
// This code should be pasted in the console when test-ultimate.html is loaded

// Step 1: Fix mousewheel handling in parent frame
const parentContainer = document.getElementById('game-container');
if (parentContainer) {
  const gameIframe = parentContainer.querySelector('iframe');
  
  if (gameIframe) {
    console.log("ZOOM FIX: Adding wheel event listener to parent container");
    
    // Make sure the wheel event is properly trapped and forwarded
    parentContainer.addEventListener('wheel', function(event) {
      event.preventDefault(); // Prevent parent page scrolling
      
      // Forward wheel delta to iframe
      const delta = event.deltaY > 0 ? 1 : -1; // Normalize to 1 or -1
      console.log("ZOOM FIX: Parent sending zoom delta:", delta);
      
      // Post message to iframe
      gameIframe.contentWindow.postMessage({
        type: 'zoom',
        delta: delta
      }, '*');
      
      return false;
    }, { passive: false });
    
    console.log("ZOOM FIX: Parent wheel handler installed successfully");
  }
}

// Step 2: Inside the iframe, add this code
if (window.parent !== window) {
  console.log("ZOOM FIX: This is the iframe - setting up message listener");
  
  // Listen for zoom messages from parent
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'zoom') {
      console.log("ZOOM FIX: Iframe received zoom message:", event.data);
      
      // Find the game mode instance
      const gameInstance = window.game; // Assuming the game instance is stored here
      if (gameInstance && gameInstance.activeGameMode) {
        const freeWorldMode = gameInstance.activeGameMode;
        
        // Update zoom level
        if (typeof freeWorldMode.zoomLevel !== 'undefined') {
          // Positive delta = zoom out, negative = zoom in
          const zoomDelta = event.data.delta * 0.5; // Reduced sensitivity
          freeWorldMode.zoomLevel += zoomDelta;
          
          // Clamp zoom level
          freeWorldMode.zoomLevel = Math.max(
            freeWorldMode.minZoom || 1.5, 
            Math.min(freeWorldMode.maxZoom || 15, freeWorldMode.zoomLevel)
          );
          
          console.log("ZOOM FIX: Zoom level updated to:", freeWorldMode.zoomLevel);
        }
      }
    }
  });
  
  // Also set up click handlers for zoom buttons inside iframe
  const zoomInButton = document.getElementById('zoom-in');
  const zoomOutButton = document.getElementById('zoom-out');
  
  if (zoomInButton && zoomOutButton) {
    console.log("ZOOM FIX: Adding click handlers to zoom buttons");
    
    zoomInButton.addEventListener('click', function() {
      console.log("ZOOM FIX: Zoom in button clicked");
      const gameInstance = window.game;
      if (gameInstance && gameInstance.activeGameMode) {
        const freeWorldMode = gameInstance.activeGameMode;
        if (typeof freeWorldMode.zoomLevel !== 'undefined') {
          freeWorldMode.zoomLevel -= 0.5; // Zoom in
          freeWorldMode.zoomLevel = Math.max(
            freeWorldMode.minZoom || 1.5, 
            Math.min(freeWorldMode.maxZoom || 15, freeWorldMode.zoomLevel)
          );
          console.log("ZOOM FIX: Zoom level updated to:", freeWorldMode.zoomLevel);
        }
      }
    });
    
    zoomOutButton.addEventListener('click', function() {
      console.log("ZOOM FIX: Zoom out button clicked");
      const gameInstance = window.game;
      if (gameInstance && gameInstance.activeGameMode) {
        const freeWorldMode = gameInstance.activeGameMode;
        if (typeof freeWorldMode.zoomLevel !== 'undefined') {
          freeWorldMode.zoomLevel += 0.5; // Zoom out
          freeWorldMode.zoomLevel = Math.max(
            freeWorldMode.minZoom || 1.5, 
            Math.min(freeWorldMode.maxZoom || 15, freeWorldMode.zoomLevel)
          );
          console.log("ZOOM FIX: Zoom level updated to:", freeWorldMode.zoomLevel);
        }
      }
    });
  }
  
  console.log("ZOOM FIX: Iframe setup completed successfully");
}

console.log("ZOOM FIX: Script executed successfully");
