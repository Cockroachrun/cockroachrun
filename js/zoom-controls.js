/**
 * ZoomControls.js - Handles camera zoom functionality for Cockroach Run
 * Allows zooming in/out using F and G keys
 */

export class ZoomControls {
  constructor(game) {
    this.game = game;
    this.camera = game.camera;
    
    // Zoom configuration
    this.defaultFOV = 75;
    this.currentFOV = this.camera ? this.camera.fov : this.defaultFOV;
    this.minFOV = 45;    // Max zoom in (smaller FOV = more zoom)
    this.maxFOV = 90;    // Max zoom out (larger FOV = less zoom)
    this.zoomStep = 5;   // How much to change FOV per keypress
    
    // Notification element
    this.notificationElement = null;
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize zoom controls
   */
  init() {
    console.log('Initializing zoom controls');
    
    // Create notification element if it doesn't exist
    if (!document.getElementById('zoom-notification')) {
      this.createNotificationElement();
    } else {
      this.notificationElement = document.getElementById('zoom-notification');
    }
    
    // Add event listener for keyboard input
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Make camera globally accessible for debugging
    window.gameCamera = this.camera;
  }
  
  /**
   * Create notification element for zoom feedback
   */
  createNotificationElement() {
    this.notificationElement = document.createElement('div');
    this.notificationElement.id = 'zoom-notification';
    this.notificationElement.style.position = 'absolute';
    this.notificationElement.style.top = '50%';
    this.notificationElement.style.left = '50%';
    this.notificationElement.style.transform = 'translate(-50%, -50%)';
    this.notificationElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.notificationElement.style.color = '#FF8000';
    this.notificationElement.style.padding = '10px 20px';
    this.notificationElement.style.borderRadius = '5px';
    this.notificationElement.style.fontFamily = 'Arial, sans-serif';
    this.notificationElement.style.fontWeight = 'bold';
    this.notificationElement.style.zIndex = '1000';
    this.notificationElement.style.opacity = '0';
    this.notificationElement.style.transition = 'opacity 0.3s';
    this.notificationElement.style.pointerEvents = 'none';
    document.body.appendChild(this.notificationElement);
    
    console.log('Zoom notification element created');
  }
  
  /**
   * Handle key down events for zoom controls
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    // F key for zoom in
    if ((event.key === 'f' || event.key === 'F') && this.camera) {
      this.zoomIn();
    }
    
    // G key for zoom out
    if ((event.key === 'g' || event.key === 'G') && this.camera) {
      this.zoomOut();
    }
  }
  
  /**
   * Zoom in (decrease FOV)
   */
  zoomIn() {
    if (!this.camera) return;
    
    this.currentFOV = Math.max(this.minFOV, this.currentFOV - this.zoomStep);
    this.camera.fov = this.currentFOV;
    this.camera.updateProjectionMatrix();
    this.showNotification('Zoomed In');
    console.log('Zoom in: FOV set to ' + this.currentFOV);
  }
  
  /**
   * Zoom out (increase FOV)
   */
  zoomOut() {
    if (!this.camera) return;
    
    this.currentFOV = Math.min(this.maxFOV, this.currentFOV + this.zoomStep);
    this.camera.fov = this.currentFOV;
    this.camera.updateProjectionMatrix();
    this.showNotification('Zoomed Out');
    console.log('Zoom out: FOV set to ' + this.currentFOV);
  }
  
  /**
   * Show zoom notification
   * @param {string} message - Notification message
   */
  showNotification(message) {
    if (!this.notificationElement) return;
    
    this.notificationElement.textContent = message;
    this.notificationElement.style.opacity = '1';
    
    // Hide after 1 second
    setTimeout(() => {
      this.notificationElement.style.opacity = '0';
    }, 1000);
  }
  
  /**
   * Clean up event listeners when no longer needed
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.notificationElement && this.notificationElement.parentNode) {
      this.notificationElement.parentNode.removeChild(this.notificationElement);
    }
  }
}

export default ZoomControls;
