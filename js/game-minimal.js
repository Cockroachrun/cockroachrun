/**
 * Cockroach Run - Minimal Game Implementation
 * Using 2D Canvas Fallback when WebGL is not available
 */

window.Game = (function() {
    // Simple variables
    let isRunning = false;
    let canvas = null;
    let ctx = null;
    let container = null;
    let hasFailed = false;
    
    // Character position (2D fallback)
    let characterX = 0;
    let characterY = 0;
    
    // Input handling
    const keys = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    // Initialize everything
    function init() {
        console.log("Initializing minimal game engine...");
        
        try {
            // Get container and canvas
            container = document.getElementById('game-container');
            canvas = document.getElementById('game-canvas');
            
            if (!container || !canvas) {
                console.error("Canvas or container not found");
                return false;
            }
            
            // Show container
            container.style.display = 'block';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '100';
            
            // Try to get WebGL context
            try {
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) {
                    throw new Error("WebGL not supported");
                }
                console.log("WebGL supported and initialized");
            } catch (e) {
                // Fallback to 2D canvas
                console.warn("WebGL not available, falling back to 2D canvas:", e);
                ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.error("Cannot get 2D context either");
                    return false;
                }
                console.log("Using 2D canvas fallback");
            }
            
            // Set canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Add input handlers
            setupInput();
            
            // Add resize handler
            window.addEventListener('resize', function() {
                if (canvas) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
            });
            
            // Start animation loop
            animate();
            
            return true;
        } catch (err) {
            console.error("Error initializing game:", err);
            hasFailed = true;
            return false;
        }
    }
    
    // Setup input handlers
    function setupInput() {
        window.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    keys.up = true;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    keys.down = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    keys.right = true;
                    break;
            }
        });
        
        window.addEventListener('keyup', function(e) {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    keys.up = false;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    keys.down = false;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    keys.right = false;
                    break;
            }
        });
        
        console.log("Input handlers set up");
    }
    
    // Update character position based on input
    function updateCharacter() {
        const speed = 5;
        
        if (keys.up) characterY -= speed;
        if (keys.down) characterY += speed;
        if (keys.left) characterX -= speed;
        if (keys.right) characterX += speed;
        
        // Keep in bounds
        characterX = Math.max(20, Math.min(canvas.width - 20, characterX));
        characterY = Math.max(20, Math.min(canvas.height - 20, characterY));
    }
    
    // Draw 2D fallback
    function draw2D() {
        if (!ctx || !canvas) return;
        
        // Clear canvas
        ctx.fillStyle = '#121212'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid (cyberpunk style)
        ctx.strokeStyle = '#00FF66'; // Neon green
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw cockroach
        ctx.fillStyle = '#9333EA'; // Purple
        ctx.beginPath();
        ctx.ellipse(characterX, characterY, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw legs
        ctx.strokeStyle = '#9333EA';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = characterX + Math.cos(angle) * 15;
            const y = characterY + Math.sin(angle) * 8;
            ctx.beginPath();
            ctx.moveTo(characterX, characterY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        
        // Draw text
        ctx.fillStyle = '#00FF66';
        ctx.font = '16px monospace';
        ctx.fillText('WebGL not supported - 2D Fallback Mode', 20, 30);
        ctx.fillText('Use arrow keys or WASD to move', 20, 60);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (!isRunning) return;
        
        // Update character
        updateCharacter();
        
        // Draw 2D fallback (if needed)
        if (ctx) {
            draw2D();
        }
    }
    
    // Public API
    return {
        startGame: function(mode, character) {
            console.log("Starting game with mode:", mode || "default", "character:", character || "default");
            
            // Initialize if needed
            if (!canvas && !hasFailed) {
                if (!init()) {
                    console.error("Failed to initialize game");
                    
                    // Show error message in container
                    container = document.getElementById('game-container');
                    if (container) {
                        container.style.display = 'block';
                        container.innerHTML = '<div style="color: #00FF66; font-family: monospace; padding: 20px; background: #121212; border: 2px solid #9333EA; max-width: 500px; margin: 100px auto; text-align: center;"><h2>WebGL Error</h2><p>Your browser does not support WebGL, which is required for Cockroach Run.</p><p>Try updating your browser or graphics drivers.</p></div>';
                    }
                    return;
                }
            }
            
            // Reset character position
            characterX = canvas ? canvas.width / 2 : 0;
            characterY = canvas ? canvas.height / 2 : 0;
            
            // Start game loop
            isRunning = true;
        },
        
        pauseGame: function() {
            isRunning = false;
        },
        
        resumeGame: function() {
            isRunning = true;
        },
        
        stopGame: function() {
            isRunning = false;
        }
    };
})();

console.log("Minimal game engine loaded");
