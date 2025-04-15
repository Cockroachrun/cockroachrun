/**
 * LoadingScreen - Enhanced cyberpunk loading screen with asset management
 * Cockroach Run Game
 */
class LoadingScreen {
  /**
   * Initialize the loading screen
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default configuration
    this.config = {
      progressBarSelector: '.progress-bar',
      percentageSelector: '#loading-percent',
      flavorTextSelector: '.flavor-text',
      cockroachIconSelector: '.cockroach-icon',
      assetIndicatorsSelector: '.asset-indicator',
      enableSounds: true,
      flavorTextInterval: 3000,
      ...options
    };

    // Loading state
    this.progress = 0;
    this.assetsLoaded = 0;
    this.assetsTotal = 0;
    this.statusOverride = false;
    this.quarterLoaded = false;
    this.halfLoaded = false;
    this.assetsByType = {
      models: { loaded: 0, total: 0 },
      textures: { loaded: 0, total: 0 },
      audio: { loaded: 0, total: 0 }
    };

    // Tiered loading - assets organized by priority
    this.tiers = {
      critical: [], // Essential for game start
      gameplay: [], // Required for gameplay
      nonEssential: [] // Can be loaded in background
    };

    // Random flavor texts to display
    this.flavorTexts = [
      "Calibrating roach sensors...",
      "Initializing survival protocols...",
      "Activating stealth systems...",
      "Scanning for threats...",
      "Loading roach movement algorithms...",
      "Mapping urban terrain...",
      "Calculating escape routes...",
      "Enhancing nocturnal vision...",
      "Processing environmental hazards..."
    ];

    // Find DOM elements
    this.progressBar = document.querySelector(this.config.progressBarSelector);
    this.percentageElement = document.querySelector(this.config.percentageSelector);
    this.flavorTextElement = document.querySelector(this.config.flavorTextSelector);
    this.cockroachIcon = document.querySelector(this.config.cockroachIconSelector);
    this.assetIndicators = document.querySelectorAll(this.config.assetIndicatorsSelector);

    // Timers and intervals
    this.flavorTextInterval = null;
    this.glitchTimeout = null;

    // Initialize
    this.init();
    
    // Only show asset indicators when actually loading
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('loading-started');
      }
    }, 1500); // Delay showing indicators to make loading seem smoother
  }

  /**
   * Initialize the loading screen
   */
  init() {
    console.log('Initializing enhanced loading screen');
    
    // Start flavor text cycling
    this.cycleFlavorText();
    
    // Add interactive elements
    this.addInteractions();

    // Initialize asset indicators
    this.updateAssetIndicators();

    // Run a fake loading sequence for demonstration
    if (this.config.useFakeLoader) {
      this.runFakeLoader();
    }

    // Pre-initialize Three.js context if available
    this.prepareThreeJsContext();
  }

  /**
   * Add interactive elements to the loading screen
   */
  addInteractions() {
    // Cockroach icon interaction
    if (this.cockroachIcon) {
      this.cockroachIcon.addEventListener('click', () => {
        // Add spin class
        this.cockroachIcon.classList.add('spin');
        
        // Remove class after animation completes
        setTimeout(() => {
          this.cockroachIcon.classList.remove('spin');
        }, 500);

        // Play sound if available
        if (this.config.enableSounds && window.AudioManager) {
          window.AudioManager.playSound('click');
        }

        // Trigger a random glitch effect
        this.triggerRandomGlitch();
      });
    }
  }

  /**
   * Run a fake loading sequence for demonstration
   */
  runFakeLoader() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          this.complete();
        }, 500);
      }
      this.updateProgress(progress / 100);
    }, 200);
  }

  /**
   * Update the progress bar and percentage
   * @param {number} percent - Progress from 0-1
   * @param {string} message - Optional status message
   */
  updateProgress(percent, message = '') {
    // Limit to range 0-1
    percent = Math.max(0, Math.min(1, percent));
    this.progress = percent;
    
    // Update visual progress
    if (this.progressBar) {
      this.progressBar.style.width = `${percent * 100}%`;
    }
    
    if (this.percentageElement) {
      this.percentageElement.textContent = `${Math.floor(percent * 100)}`;
    }
    
    // Optional status message
    if (message && this.flavorTextElement) {
      this.statusOverride = true;
      this.flavorTextElement.textContent = message;
      
      // Resume normal flavor text cycling after 4 seconds
      setTimeout(() => {
        this.statusOverride = false;
      }, 4000);
    }
    
    // Trigger effects at progress milestones
    if (percent > 0.25 && !this.quarterLoaded) {
      this.quarterLoaded = true;
      this.triggerGlitchEffect();
    }
    
    if (percent > 0.5 && !this.halfLoaded) {
      this.halfLoaded = true;
      this.triggerScanEffect();
    }
    
    // Complete loading when done
    if (percent >= 1) {
      setTimeout(() => {
        this.complete();
      }, 500);
    }
  }

  /**
   * Cycle through flavor texts
   */
  cycleFlavorText() {
    if (!this.flavorTextElement) return;
    
    let index = 0;
    // Clear any existing interval
    if (this.flavorTextInterval) {
      clearInterval(this.flavorTextInterval);
    }
    
    // Set initial text
    this.flavorTextElement.textContent = this.flavorTexts[0];
    
    // Set up interval for text cycling
    this.flavorTextInterval = setInterval(() => {
      // Only change text if not overridden by a status message
      if (!this.statusOverride) {
        index = (index + 1) % this.flavorTexts.length;
        
        // Fade out text
        this.flavorTextElement.style.opacity = '0';
        
        // Change text and fade back in after a short delay
        setTimeout(() => {
          this.flavorTextElement.textContent = this.flavorTexts[index];
          this.flavorTextElement.style.opacity = '0.8';
        }, 300);
      }
    }, this.config.flavorTextInterval);
  }

  /**
   * Trigger a glitch effect on the loading title
   */
  triggerGlitchEffect() {
    const loadingTitle = document.querySelector('.loading-title');
    if (!loadingTitle) return;
    
    // Temporarily boost the glitch effect
    loadingTitle.style.animation = 'glitch-effect 0.3s infinite';
    
    // Reset after a short period
    setTimeout(() => {
      loadingTitle.style.animation = '';
    }, 1000);
  }

  /**
   * Trigger a random glitch effect somewhere on screen
   */
  triggerRandomGlitch() {
    // Clear any existing timeout
    if (this.glitchTimeout) {
      clearTimeout(this.glitchTimeout);
    }
    
    // Choose a random element to glitch
    const glitchTargets = [
      document.querySelector('.loading-title'),
      document.querySelector('.progress-container'),
      document.querySelector('.flavor-text')
    ].filter(el => el !== null);
    
    if (glitchTargets.length === 0) return;
    
    const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
    const originalTransform = target.style.transform;
    
    // Apply a random transform
    target.style.transform = `skew(${Math.random() * 10 - 5}deg, ${Math.random() * 10 - 5}deg)`;
    target.style.filter = 'hue-rotate(90deg)';
    
    // Reset after a short period
    this.glitchTimeout = setTimeout(() => {
      target.style.transform = originalTransform;
      target.style.filter = '';
    }, 200);
  }

  /**
   * Trigger the scan effect
   */
  triggerScanEffect() {
    const scanLine = document.querySelector('.scan-line');
    if (!scanLine) return;
    
    // Speed up the scan animation temporarily
    scanLine.style.animation = 'scan 0.8s linear 3';
    
    // Reset after the effect
    setTimeout(() => {
      scanLine.style.animation = 'scan 2s linear infinite';
    }, 2400);
  }

  /**
   * Update the asset indicators
   */
  updateAssetIndicators() {
    if (!this.assetIndicators) return;
    
    this.assetIndicators.forEach(indicator => {
      const type = indicator.getAttribute('data-type');
      const statusElement = indicator.querySelector('.asset-status');
      
      if (type && statusElement && this.assetsByType[type]) {
        const { loaded, total } = this.assetsByType[type];
        
        // Update status attribute
        if (total === 0) {
          indicator.setAttribute('data-status', 'waiting');
          statusElement.textContent = 'Waiting';
        } else if (loaded < total) {
          indicator.setAttribute('data-status', 'loading');
          statusElement.textContent = `${loaded}/${total}`;
        } else {
          indicator.setAttribute('data-status', 'complete');
          statusElement.textContent = 'Complete';
        }
      }
    });
  }

  /**
   * Update progress for a specific asset type
   * @param {string} type - Asset type (models, textures, audio)
   * @param {number} loaded - Number of assets loaded
   * @param {number} total - Total assets to load
   */
  updateAssetTypeProgress(type, loaded, total) {
    if (this.assetsByType[type]) {
      this.assetsByType[type] = { loaded, total };
      this.updateAssetIndicators();
      
      // Recalculate overall progress
      this.recalculateOverallProgress();
    }
  }

  /**
   * Recalculate overall progress based on all asset types
   */
  recalculateOverallProgress() {
    let totalLoaded = 0;
    let totalAssets = 0;
    
    // Sum up all asset types
    Object.values(this.assetsByType).forEach(({ loaded, total }) => {
      totalLoaded += loaded;
      totalAssets += total;
    });
    
    // Update the total counts
    this.assetsLoaded = totalLoaded;
    this.assetsTotal = totalAssets;
    
    // Calculate and update progress
    if (totalAssets > 0) {
      const percent = totalLoaded / totalAssets;
      this.updateProgress(percent);
    }
  }

  /**
   * Pre-initialize Three.js context if available
   */
  prepareThreeJsContext() {
    // Skip if Three.js is not available
    if (typeof THREE === 'undefined') return;
    
    // Create minimal scene to prepare GPU
    this.threeContext = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
      renderer: new THREE.WebGLRenderer({ alpha: true, antialias: false })
    };
    
    // Use low quality settings for initialization
    this.threeContext.renderer.setPixelRatio(1);
    this.threeContext.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    
    // Create placeholder geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff9000 });
    this.threeContext.placeholder = new THREE.Mesh(geometry, material);
    this.threeContext.scene.add(this.threeContext.placeholder);
    
    // Add to DOM but keep hidden
    this.threeContext.renderer.domElement.style.position = 'absolute';
    this.threeContext.renderer.domElement.style.top = '0';
    this.threeContext.renderer.domElement.style.left = '0';
    this.threeContext.renderer.domElement.style.opacity = '0';
    this.threeContext.renderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(this.threeContext.renderer.domElement);
    
    // Minimal animation loop
    const animate = () => {
      if (this.threeContext.placeholder) {
        this.threeContext.placeholder.rotation.x += 0.01;
        this.threeContext.placeholder.rotation.y += 0.01;
      }
      this.threeContext.renderer.render(this.threeContext.scene, this.threeContext.camera);
      this.threeContext.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * Load assets using a tiered approach
   * @param {string} tierName - Tier name (critical, gameplay, nonEssential)
   * @param {Array} assets - Array of assets to load
   * @param {Function} progressCallback - Callback to report progress
   */
  async loadTier(tierName, assets, progressCallback) {
    if (!assets || !Array.isArray(assets) || assets.length === 0) return;
    
    // Store assets in tier
    this.tiers[tierName] = assets;
    
    let loaded = 0;
    const total = assets.length;
    
    // Update status with new tier
    if (this.flavorTextElement) {
      this.statusOverride = true;
      this.flavorTextElement.textContent = `Loading ${tierName} assets...`;
    }
    
    // Process each asset
    for (const asset of assets) {
      const type = this.getAssetType(asset.url);
      
      // Update asset type counts
      if (this.assetsByType[type]) {
        this.assetsByType[type].total++;
        this.updateAssetIndicators();
      }
      
      try {
        // Load asset based on size and type
        if (asset.size && asset.size > 1000000) {
          // Large assets use worker (if available)
          await this.loadWithWorker(asset);
        } else {
          // Small assets load directly
          await this.loadDirectly(asset);
        }
        
        // Asset loaded successfully
        loaded++;
        
        // Update asset type progress
        if (this.assetsByType[type]) {
          this.assetsByType[type].loaded++;
          this.updateAssetIndicators();
        }
        
        // Report progress for this tier
        if (progressCallback) {
          progressCallback(loaded / total, tierName);
        }
        
      } catch (error) {
        console.error(`Failed to load asset: ${asset.url}`, error);
      }
    }
    
    // Reset status override
    this.statusOverride = false;
    
    // Return true if all assets loaded successfully
    return loaded === total;
  }

  /**
   * Determine asset type from URL
   * @param {string} url - Asset URL
   * @returns {string} Asset type (models, textures, audio)
   */
  getAssetType(url) {
    if (!url) return 'other';
    
    const lowerUrl = url.toLowerCase();
    
    // Check file extension
    if (lowerUrl.endsWith('.glb') || lowerUrl.endsWith('.gltf') || lowerUrl.endsWith('.obj')) {
      return 'models';
    } else if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpeg') || 
               lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.svg')) {
      return 'textures';
    } else if (lowerUrl.endsWith('.mp3') || lowerUrl.endsWith('.wav') || lowerUrl.endsWith('.ogg')) {
      return 'audio';
    }
    
    return 'other';
  }

  /**
   * Load an asset directly
   * @param {Object} asset - Asset to load
   * @returns {Promise} - Resolves when asset is loaded
   */
  loadDirectly(asset) {
    return new Promise((resolve, reject) => {
      const { url, type } = asset;
      
      // Handle different asset types
      if (type === 'image' || this.getAssetType(url) === 'textures') {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
      } else if (type === 'audio' || this.getAssetType(url) === 'audio') {
        const audio = new Audio();
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = (err) => reject(err);
        audio.src = url;
      } else if (type === 'json') {
        fetch(url)
          .then(response => response.json())
          .then(resolve)
          .catch(reject);
      } else if (type === 'text') {
        fetch(url)
          .then(response => response.text())
          .then(resolve)
          .catch(reject);
      } else {
        // Generic file loader
        fetch(url)
          .then(response => response.blob())
          .then(resolve)
          .catch(reject);
      }
    });
  }

  /**
   * Load an asset using a web worker
   * @param {Object} asset - Asset to load
   * @returns {Promise} - Resolves when asset is loaded
   */
  loadWithWorker(asset) {
    // Check if Web Workers are supported
    if (typeof Worker === 'undefined') {
      return this.loadDirectly(asset);
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Create a worker with inline script for broader compatibility
        const workerScript = `
          self.onmessage = function(e) {
            const { url } = e.data;
            fetch(url)
              .then(response => response.blob())
              .then(blob => {
                self.postMessage({ success: true, blob });
              })
              .catch(error => {
                self.postMessage({ success: false, error: error.message });
              });
          };
        `;
        
        // Create blob and worker
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        // Handle worker messages
        worker.onmessage = function(e) {
          const { success, blob, error } = e.data;
          
          if (success) {
            resolve(blob);
          } else {
            reject(new Error(error));
          }
          
          // Terminate worker when done
          worker.terminate();
        };
        
        // Handle worker errors
        worker.onerror = function(err) {
          reject(err);
          worker.terminate();
        };
        
        // Start the worker
        worker.postMessage({ url: asset.url });
        
      } catch (err) {
        // Fallback to direct loading if worker fails
        console.warn('Web Worker failed, falling back to direct loading', err);
        return this.loadDirectly(asset);
      }
    });
  }

  /**
   * Complete the loading process and transition to game
   */
  complete() {
    console.log('Loading complete, transitioning to game');
    
    // Clear intervals
    if (this.flavorTextInterval) {
      clearInterval(this.flavorTextInterval);
      this.flavorTextInterval = null;
    }
    
    // Cancel any animation frame for Three.js context
    if (this.threeContext && this.threeContext.animationFrame) {
      cancelAnimationFrame(this.threeContext.animationFrame);
    }
    
    // Optional: Animate out the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      
      setTimeout(() => {
        // Remove active class
        loadingScreen.classList.remove('active');
        
        // Show the start screen
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
          startScreen.classList.add('active');
          setTimeout(() => {
            startScreen.style.opacity = '1';
          }, 50);
        }
        
        // Notify that loading is complete
        if (window.GameState) {
          window.GameState.loadingComplete = true;
        }
        
        // Prepare Three.js for game if context was created
        if (this.threeContext) {
          this.transitionThreeJsToGame();
        }
      }, 1000);
    }
  }

  /**
   * Transition Three.js context to game
   */
  transitionThreeJsToGame() {
    if (!this.threeContext) return;
    
    // Make renderer visible
    this.threeContext.renderer.domElement.style.opacity = '1';
    
    // Improve quality
    this.threeContext.renderer.setPixelRatio(window.devicePixelRatio);
    this.threeContext.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Remove placeholder
    if (this.threeContext.placeholder) {
      this.threeContext.scene.remove(this.threeContext.placeholder);
      this.threeContext.placeholder = null;
    }
    
    // Pass context to game if needed
    if (window.GameState) {
      window.GameState.threeContext = this.threeContext;
    }
  }
}

// Initialize loading screen when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create a single global instance
  window.loadingScreen = new LoadingScreen({
    useFakeLoader: true, // Use fake loader for demonstration
    enableSounds: true
  });
  
  // Example usage: Load critical assets first
  /*
  window.loadingScreen.loadTier('critical', [
    { url: 'assets/models/player.glb', type: 'model', size: 2000000 },
    { url: 'assets/images/textures/main.jpg', type: 'image', size: 500000 }
  ], (progress, tier) => {
    console.log(`${tier} assets: ${Math.floor(progress * 100)}% loaded`);
  }).then(() => {
    // Load gameplay assets after critical assets are loaded
    return window.loadingScreen.loadTier('gameplay', [
      // More assets...
    ]);
  });
  */
  
  // Add interactivity to cockroach icon
  const cockroachIcon = document.querySelector('.cockroach-icon');
  if (cockroachIcon) {
    cockroachIcon.addEventListener('click', () => {
      cockroachIcon.style.animation = 'spin 0.5s linear';
      setTimeout(() => {
        cockroachIcon.style.animation = 'float 3s ease-in-out infinite';
      }, 500);
    });
  }
});
