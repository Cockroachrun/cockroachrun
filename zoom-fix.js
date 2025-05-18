// IMPROVED Zoom functionality fix for Cockroach Run game
// This script handles mouse wheel zoom and button zoom with enhanced reliability

// Wait for document to be fully loaded before running
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, waiting for game to initialize...');
  
  // No need to check for iframe in the standalone version
  // We'll directly add event listeners to the game container
  
  // Try to use the existing camera directly
  const checkInterval = setInterval(function() {
    if (window.camera) {
      console.log('Camera found, applying zoom fix...');
      setupDirectZoom();
      clearInterval(checkInterval);
    } else {
      console.log('Still looking for camera...');
    }
  }, 1000);
  
  function setupDirectZoom() {
    // Set up zoom properties
    const defaultFOV = 75;
    const minFOV = 45;
    const maxFOV = 90;
    const zoomStep = 5;
    let currentFOV = window.camera.fov;
    
    // Add wheel event for zooming
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.addEventListener('wheel', function(event) {
        // Prevent the default scroll
        event.preventDefault();
        
        // Calculate zoom delta (reversed, as negative deltaY means scroll up/zoom in)
        const delta = event.deltaY > 0 ? -1 : 1;
        
        // Update FOV based on wheel direction
        if (delta > 0) {
          // Zoom in
          currentFOV = Math.max(minFOV, currentFOV - zoomStep * 0.2);
        } else {
          // Zoom out
          currentFOV = Math.min(maxFOV, currentFOV + zoomStep * 0.2);
        }
        
        // Apply the new FOV
        window.camera.fov = currentFOV;
        window.camera.updateProjectionMatrix();
        
        console.log(`Zoomed with wheel: FOV = ${currentFOV}`);
        
        // Show notification if the function exists
        if (typeof showZoomNotification === 'function') {
          showZoomNotification(delta > 0 ? 'Zoomed In' : 'Zoomed Out');
        }
        
        return false;
      }, { passive: false });
      
      console.log('Mouse wheel zoom controls enabled');
    }
  }
});
    
    // Check for game object
    if (!iframe.contentWindow.game || !iframe.contentWindow.game.activeGameMode) {
      console.log("Game not initialized yet, waiting...");
      setTimeout(checkIframe, 500);
      return;
    }
    
    // We have everything we need, apply the fix
    applyZoomFix(iframe);
  }
  
  // Apply the zoom functionality to the iframe
  function applyZoomFunctionality(iframe, iframeWindow, iframeDocument) {
    console.log("Applying zoom functionality...");
    
    try {
      // Get game mode
      const gameMode = iframeWindow.game.activeGameMode;
      const THREE = iframeWindow.THREE;
      
      // Set up zoom properties
      gameMode.zoomLevel = 1;
      const MIN_ZOOM = 0.5;
      const MAX_ZOOM = 2;
      
      // Store original cameraOffset
      if (!gameMode.originalCameraOffset && gameMode.cameraOffset) {
        gameMode.originalCameraOffset = gameMode.cameraOffset.clone();
      }
      
      // Handle mouse wheel events
      const handleWheel = function(event) {
        // Make sure we prevent the default scroll
        event.preventDefault();
        event.stopPropagation();
        
        // Calculate zoom delta (reversed, as negative deltaY means scroll up/zoom in)
        const delta = event.deltaY > 0 ? -0.05 : 0.05;
        
        // Update zoom level with bounds
        gameMode.zoomLevel = Math.max(MIN_ZOOM, Math.min(gameMode.zoomLevel + delta, MAX_ZOOM));
        
        console.log("Zoom level updated:", gameMode.zoomLevel);
        return false;
      };
      
      // CRITICAL: Add wheel event listeners to multiple elements
      const canvas = iframeDocument.querySelector('canvas');
      if (canvas) {
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        console.log("Added wheel listener to canvas");
      }
      
      iframeDocument.body.addEventListener("wheel", handleWheel, { passive: false });
      console.log("Added wheel listener to body");
      
      iframeDocument.addEventListener("wheel", handleWheel, { passive: false });
      console.log("Added wheel listener to document");
      
      // Try parent window wheel event too
      window.addEventListener("wheel", function(event) {
        if (event.target.closest('#game-container')) {
          handleWheel(event);
        }
      }, { passive: false });
      
      // Update the camera function to use zoom level
      gameMode.updateCamera = function() {
        // Skip if debug mode is on
        if (this.debugMode) return;
        
        // Get model (cockroach or placeholder)
        const model = this.cockroachModel || this.placeholder;
        if (!model) return;
        
        // Use original camera offset for calculations
        const baseOffset = this.originalCameraOffset || this.cameraOffset;
        
        // Create new offset vector and apply zoom
        const offset = baseOffset.clone();
        offset.multiplyScalar(this.zoomLevel);
        
        // Apply model rotation to offset
        if (model.rotation) {
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y);
        }
        
        // Calculate camera position
        const cameraPosition = model.position.clone().add(offset);
        
        // Apply camera position with smooth transition
        this.camera.position.lerp(cameraPosition, 0.05);
        
        // Look at cockroach with slight offset
        const lookTarget = model.position.clone();
        lookTarget.y += 0.5; // Look slightly above
        this.camera.lookAt(lookTarget);
      };
      
      // Add button handlers
      setupZoomButtons(iframeDocument, gameMode, MIN_ZOOM, MAX_ZOOM);
      
      console.log("Zoom functionality successfully applied!");
      console.log("Use mouse wheel to zoom in and out, or the zoom buttons.");
      
      // Create visual indicator of success
      createSuccessIndicator(iframeDocument);
      
      return true;
    } catch (error) {
      console.error("Error applying zoom functionality:", error);
      return false;
    }
  }
  
  // Set up zoom buttons
  function setupZoomButtons(iframeDocument, gameMode, MIN_ZOOM, MAX_ZOOM) {
    // Try multiple possible button IDs
    const zoomInButton = iframeDocument.getElementById("zoom-in-button") || 
                          iframeDocument.getElementById("zoom-in");
                          
    const zoomOutButton = iframeDocument.getElementById("zoom-out-button") || 
                           iframeDocument.getElementById("zoom-out");
    
    if (zoomInButton) {
      zoomInButton.addEventListener("click", function() {
        gameMode.zoomLevel = Math.min(gameMode.zoomLevel + 0.1, MAX_ZOOM);
        console.log("Zoom in clicked, level:", gameMode.zoomLevel);
      });
      console.log("Zoom in button handler added");
    } else {
      console.log("Zoom in button not found");
    }
    
    if (zoomOutButton) {
      zoomOutButton.addEventListener("click", function() {
        gameMode.zoomLevel = Math.max(gameMode.zoomLevel - 0.1, MIN_ZOOM);
        console.log("Zoom out clicked, level:", gameMode.zoomLevel);
      });
      console.log("Zoom out button handler added");
    } else {
      console.log("Zoom out button not found");
    }
  }
  
  // Create a visual indicator to show the fix was applied
  function createSuccessIndicator(iframeDocument) {
    try {
      const indicator = iframeDocument.createElement('div');
      indicator.style.position = 'absolute';
      indicator.style.bottom = '10px';
      indicator.style.right = '10px';
      indicator.style.background = 'rgba(0,0,0,0.7)';
      indicator.style.color = '#00FF66';
      indicator.style.padding = '8px';
      indicator.style.borderRadius = '4px';
      indicator.style.fontFamily = 'Arial, sans-serif';
      indicator.style.fontSize = '12px';
      indicator.style.zIndex = '9999';
      indicator.textContent = 'Zoom enabled! Use mouse wheel or buttons';
      
      // Add to document
      iframeDocument.body.appendChild(indicator);
      
      // Remove after 5 seconds
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 5000);
    } catch (e) {
      console.log('Failed to create indicator:', e);
    }
  }
});

