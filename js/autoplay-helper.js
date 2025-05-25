/**
 * Autoplay Helper - Enhanced user interaction detection for music autoplay
 * Handles browser autoplay restrictions with visual feedback and user prompts
 */

class AutoplayHelper {
  constructor() {
    this.hasUserInteracted = false;
    this.audioUnlocked = false;
    this.pendingMusicRequests = [];
    this.overlay = null;
    this.isOverlayVisible = false;
    
    this.init();
  }
  
  init() {
    // Track user interactions
    this.addInteractionListeners();
    
    // Check for existing audio permissions
    this.checkAudioPermissions();
    
    console.log('AutoplayHelper initialized');
  }
  
  addInteractionListeners() {
    const events = ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, this.handleUserInteraction.bind(this), { 
        once: false, 
        passive: true 
      });
    });
  }
  
  handleUserInteraction(event) {
    if (!this.hasUserInteracted) {
      console.log('First user interaction detected:', event.type);
      this.hasUserInteracted = true;
      
      // Try to unlock audio context
      this.unlockAudioContext();
      
      // Process any pending music requests
      this.processPendingRequests();
      
      // Hide overlay if it's showing
      this.hideOverlay();
    }
  }
  
  async unlockAudioContext() {
    try {
      // Create a silent audio to unlock the context
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAAAAAAAAAAA';
      silentAudio.volume = 0;
      
      await silentAudio.play();
      silentAudio.pause();
      
      this.audioUnlocked = true;
      console.log('Audio context unlocked successfully');
      
      // Try to resume AudioContext if suspended
      if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log('AudioContext resumed');
        }
      }
      
      return true;
    } catch (error) {
      console.warn('Failed to unlock audio context:', error);
      return false;
    }
  }
  
  async checkAudioPermissions() {
    try {
      // Check if we can play audio immediately
      const testAudio = new Audio();
      testAudio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAAAAAAAAAAA';
      testAudio.volume = 0;
      
      const playPromise = testAudio.play();
      if (playPromise) {
        await playPromise;
        testAudio.pause();
        
        this.audioUnlocked = true;
        this.hasUserInteracted = true;
        console.log('Audio is already unlocked');
      }
    } catch (error) {
      console.log('Audio requires user interaction');
    }
  }
  
  requestMusicPlay(audioElement, options = {}) {
    const request = {
      audioElement,
      options,
      timestamp: Date.now()
    };
    
    if (this.hasUserInteracted && this.audioUnlocked) {
      // Try to play immediately
      return this.attemptPlay(request);
    } else {
      // Store for later and show overlay
      this.pendingMusicRequests.push(request);
      this.showOverlay(options);
      return Promise.reject(new Error('User interaction required'));
    }
  }
  
  async attemptPlay(request) {
    const { audioElement, options } = request;
    
    try {
      if (options.resetTime) {
        audioElement.currentTime = 0;
      }
      
      await audioElement.play();
      console.log('Music playback started successfully');
      return true;
    } catch (error) {
      console.warn('Music playback failed:', error);
      
      // If this was an autoplay restriction, show overlay
      if (error.name === 'NotAllowedError') {
        this.showOverlay(options);
      }
      
      throw error;
    }
  }
  
  processPendingRequests() {
    if (this.pendingMusicRequests.length === 0) return;
    
    console.log(`Processing ${this.pendingMusicRequests.length} pending music requests`);
    
    // Process the most recent request first
    const latestRequest = this.pendingMusicRequests.pop();
    this.attemptPlay(latestRequest).catch(error => {
      console.warn('Failed to play pending music:', error);
    });
    
    // Clear all other pending requests
    this.pendingMusicRequests = [];
  }
  
  showOverlay(options = {}) {
    if (this.isOverlayVisible) return;
    
    const overlayContent = options.gameContext ? 
      'Click anywhere to start the game music!' : 
      'Click anywhere to start the menu music!';
    
    this.overlay = document.createElement('div');
    this.overlay.id = 'autoplay-overlay';
    this.overlay.innerHTML = `
      <div class="autoplay-overlay-content">
        <div class="autoplay-icon">🎵</div>
        <h3>Music Ready</h3>
        <p>${overlayContent}</p>
        <button class="autoplay-button">Play Music</button>
      </div>
    `;
    
    // Style the overlay
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: 'Orbitron', monospace;
      color: #fff;
    `;
    
    const contentStyle = `
      background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
      border: 2px solid #ff6600;
      border-radius: 10px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 0 20px rgba(255, 102, 0, 0.5);
      max-width: 400px;
      animation: fadeIn 0.3s ease-out;
    `;
    
    const buttonStyle = `
      background: linear-gradient(45deg, #ff6600, #ff8533);
      border: none;
      border-radius: 5px;
      color: #000;
      font-weight: bold;
      padding: 12px 24px;
      margin-top: 15px;
      cursor: pointer;
      font-family: 'Orbitron', monospace;
      transition: transform 0.2s ease;
      font-size: 14px;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      .autoplay-button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 10px rgba(255, 102, 0, 0.7);
      }
      
      .autoplay-icon {
        font-size: 48px;
        margin-bottom: 15px;
      }
    `;
    document.head.appendChild(style);
    
    this.overlay.querySelector('.autoplay-overlay-content').style.cssText = contentStyle;
    this.overlay.querySelector('.autoplay-button').style.cssText = buttonStyle;
    
    // Add click handlers
    this.overlay.addEventListener('click', this.handleOverlayClick.bind(this));
    
    document.body.appendChild(this.overlay);
    this.isOverlayVisible = true;
    
    console.log('Autoplay overlay shown');
  }
  
  handleOverlayClick(event) {
    // Trigger user interaction
    this.handleUserInteraction(event);
  }
  
  hideOverlay() {
    if (this.overlay && this.isOverlayVisible) {
      this.overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
      
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
        this.isOverlayVisible = false;
      }, 300);
      
      console.log('Autoplay overlay hidden');
    }
  }
  
  // Public API for AudioManager
  canPlayAudio() {
    return this.hasUserInteracted && this.audioUnlocked;
  }
  
  // Force unlock for testing
  forceUnlock() {
    this.hasUserInteracted = true;
    this.audioUnlocked = true;
    this.hideOverlay();
    this.processPendingRequests();
  }
}

// Add CSS for fade out animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.9); }
  }
`;
document.head.appendChild(fadeOutStyle);

// Create global instance
window.AutoplayHelper = new AutoplayHelper();

export default AutoplayHelper;
