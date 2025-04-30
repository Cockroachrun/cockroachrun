/**
 * Cockroach Run - Advanced Model Loader
 * Handles searching for and loading 3D models with extensive fallbacks and debugging
 */

class ModelLoader {
    constructor() {
        this.debugElement = document.getElementById('debug-info') || document.createElement('div');
        this.loadAttempts = 0;
        this.maxAttempts = 10;
    }
    
    /**
     * Log a message to console and optional debug element
     */
    log(message) {
        console.log(`[ModelLoader] ${message}`);
        
        if (this.debugElement) {
            this.debugElement.innerHTML += `[ModelLoader] ${message}<br>`;
            // Keep only recent messages
            const lines = this.debugElement.innerHTML.split('<br>');
            if (lines.length > 15) {
                this.debugElement.innerHTML = lines.slice(lines.length - 15).join('<br>');
            }
        }
    }
    
    /**
     * Get GLTFLoader instance, trying multiple approaches
     */
    getLoader() {
        // Try multiple ways to get GLTFLoader
        if (typeof THREE.GLTFLoader !== 'undefined') {
            this.log('Using THREE.GLTFLoader');
            return new THREE.GLTFLoader();
        } else if (typeof GLTFLoader !== 'undefined') {
            this.log('Using global GLTFLoader');
            return new GLTFLoader();
        } else if (typeof window.GLTFLoader !== 'undefined') {
            this.log('Using window.GLTFLoader');
            return new window.GLTFLoader();
        }
        
        this.log('ERROR: GLTFLoader not found! Using placeholder');
        return null;
    }
    
    /**
     * Load cockroach model with extensive fallbacks
     */
    loadCockroachModel(character, scene, onSuccess) {
        this.loadAttempts = 0;
        
        // Reset and start fresh
        this.log(`Loading ${character} cockroach model...`);
        
        // Create list of all possible paths to try
        const paths = this.getModelPaths(character);
        
        // Try loading from multiple paths
        this.tryLoadingFromPaths(paths, scene, onSuccess);
    }
    
    /**
     * Get all possible model paths to try
     */
    getModelPaths(character) {
        // Base paths to try
        const basePaths = [
            'assets/models/',
            'models/',
            '',
            '../assets/models/',
            '../models/'
        ];
        
        // Filename variations
        let fileNames = [];
        
        if (character === 'american') {
            fileNames = [
                'American Cockroach.glb',
                'american-cockroach.glb',
                'american_cockroach.glb',
                'AmericanCockroach.glb',
                'cockroach.glb'
            ];
        } else if (character === 'oriental') {
            fileNames = [
                'Oriental cockroach.glb',
                'oriental-cockroach.glb',
                'oriental_cockroach.glb',
                'OrientalCockroach.glb',
                'cockroach.glb'
            ];
        } else {
            fileNames = [
                'cockroach.glb',
                'American Cockroach.glb',
                'american-cockroach.glb'
            ];
        }
        
        // Generate all combinations
        const paths = [];
        for (const basePath of basePaths) {
            for (const fileName of fileNames) {
                paths.push(basePath + fileName);
            }
        }
        
        this.log(`Generated ${paths.length} potential model paths to try`);
        return paths;
    }
    
    /**
     * Try loading from each path in sequence
     */
    tryLoadingFromPaths(paths, scene, onSuccess) {
        if (paths.length === 0 || this.loadAttempts >= this.maxAttempts) {
            this.log(`ERROR: Failed to load model after ${this.loadAttempts} attempts`);
            return;
        }
        
        const path = paths[0];
        this.loadAttempts++;
        
        this.log(`Attempt ${this.loadAttempts}: Loading from ${path}`);
        
        // Get loader
        const loader = this.getLoader();
        if (!loader) {
            this.log('Cannot load model: GLTFLoader not available');
            return;
        }
        
        // Try to load the model
        loader.load(
            path,
            (gltf) => {
                // Success!
                this.log(`SUCCESS! Model loaded from: ${path}`);
                
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(gltf);
                }
            },
            (xhr) => {
                // Progress
                if (xhr.lengthComputable) {
                    const percent = (xhr.loaded / xhr.total * 100).toFixed(2);
                    this.log(`Loading: ${percent}%`);
                }
            },
            (error) => {
                // Error, try next path
                this.log(`Failed to load from ${path}: ${error.message}`);
                this.tryLoadingFromPaths(paths.slice(1), scene, onSuccess);
            }
        );
    }
}

// Create global instance
window.modelLoader = new ModelLoader();
