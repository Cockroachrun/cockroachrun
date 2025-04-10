import { createLoadingScreen } from '../../screens/loading-screen.js';
import { createStartScreen } from '../../screens/start-screen.js';

class UIManager {
  constructor() {
    this.container = null;
    this.activeScreen = null;
    this.screens = {};
    this.eventListeners = {};
  }
  
  init() {
    this.container = document.getElementById('ui-container');
    
    if (!this.container) {
      throw new Error('UI container not found. Make sure there is an element with id "ui-container" in your HTML.');
    }
    
    // Initialize screens
    this.screens['loading-screen'] = createLoadingScreen(this);
    this.screens['start-screen'] = createStartScreen(this);
    
    // Add screens to the DOM
    Object.values(this.screens).forEach(screen => {
      this.container.appendChild(screen.element);
    });
    
    console.log('UI Manager initialized');
    return this;
  }
  
  showScreen(screenId) {
    const screen = this.screens[screenId];
    
    if (!screen) {
      console.error(`Screen "${screenId}" not found.`);
      return;
    }
    
    // Hide active screen if there is one
    if (this.activeScreen) {
      this.activeScreen.element.classList.remove('active');
      this.activeScreen.onHide?.();
    }
    
    // Show new screen
    screen.element.classList.add('active');
    screen.onShow?.();
    
    this.activeScreen = screen;
    console.log(`Showing screen: ${screenId}`);
    
    return this;
  }
  
  updateLoadingProgress(progress) {
    const loadingScreen = this.screens['loading-screen'];
    if (loadingScreen && loadingScreen.updateProgress) {
      loadingScreen.updateProgress(progress);
    }
  }
  
  addScreen(screenId, screen) {
    this.screens[screenId] = screen;
    this.container.appendChild(screen.element);
    return this;
  }
  
  removeScreen(screenId) {
    const screen = this.screens[screenId];
    if (screen) {
      if (this.activeScreen === screen) {
        this.activeScreen = null;
      }
      this.container.removeChild(screen.element);
      delete this.screens[screenId];
    }
    return this;
  }
  
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    return this;
  }
  
  off(event, callback) {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(callback);
      if (index !== -1) {
        this.eventListeners[event].splice(index, 1);
      }
    }
    return this;
  }
  
  emit(event, ...args) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        callback(...args);
      });
    }
    return this;
  }
}

// Singleton pattern
let uiInstance = null;

export const initUI = async () => {
  if (!uiInstance) {
    uiInstance = new UIManager();
    uiInstance.init();
  }
  return uiInstance;
};

export const getUI = () => {
  if (!uiInstance) {
    throw new Error('UI Manager not initialized. Call initUI() first.');
  }
  return uiInstance;
}; 