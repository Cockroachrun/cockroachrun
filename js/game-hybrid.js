/**
 * Cockroach Run - Hybrid Game Engine
 * Tries WebGL first, falls back to 2D Canvas
 */

window.Game = (function() {
    // Variables
    let isRunning = false;
    let canvas = null;
    let ctx = null;
    let container = null;
    
    // 2D canvas variables
    let characterX = 0;
    let characterY = 0;
    let rotation = 0;
    let lastTimestamp = 0;
    
    // Input
    const keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        jump: false
    };
    
    // Check WebGL support thoroughly
    function detectWebGLContext() {
        // Create canvas element
        const canvas = document.createElement("canvas");
        
        // Get WebGL context
        let gl = null;
        
        try {
            // Try to get standard context
            gl = canvas.getContext("webgl");
            if (!gl) {
                // Try experimental
                gl = canvas.getContext("experimental-webgl");
            }
        } catch(e) {
            return false;
        }
        
        if (!gl) {
            return false;
        }
        
        return true;
    }
    
    // Initialize 2D canvas game
    function init2DGame() {
        console.log("Initializing 2D fallback game...");
        
        try {
            // Get elements
            canvas = document.getElementById('game-canvas');
            container = document.getElementById('game-container');
            
            if (!canvas || !container) {
                console.error("Canvas or container not found");
                return false;
            }
            
            // Set container style
            container.style.display = 'block';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '100';
            
            // Set canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Get 2D context
            ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Could not get 2D context");
                return false;
            }
            
            // Initial character position
            characterX = canvas.width / 2;
            characterY = canvas.height / 2;
            
            // Add input handlers
            setupInput();
            
            // Add resize handler
            window.addEventListener('resize', function() {
                if (canvas) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
            });
            
            // Start animation
            requestAnimationFrame(animate2D);
            
            return true;
        } catch (err) {
            console.error("Error initializing 2D game:", err);
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
                case ' ':
                    keys.jump = true;
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
                case ' ':
                    keys.jump = false;
                    break;
            }
        });
    }
    
    // Draw cyberpunk grid background
    function drawGrid() {
        if (!ctx || !canvas) return;
        
        // Fill background
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        const gridSize = 50;
        const gridColor = '#00FF66';
        
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        
        ctx.stroke();
        
        // Add gradient effects for cyberpunk feel
        const gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0,
            canvas.width/2, canvas.height/2, canvas.width/2
        );
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw cyberpunk cockroach
    function drawCockroach() {
        if (!ctx || !canvas) return;
        
        // Save context
        ctx.save();
        
        // Move to cockroach position and rotate
        ctx.translate(characterX, characterY);
        ctx.rotate(rotation);
        
        // Draw body (oval shape)
        ctx.fillStyle = '#9333EA';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw head
        ctx.fillStyle = '#00FF66';
        ctx.beginPath();
        ctx.ellipse(15, 0, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw legs
        ctx.strokeStyle = '#9333EA';
        ctx.lineWidth = 2;
        
        // Left legs
        for (let i = 0; i < 3; i++) {
            const angle = Math.PI / 2 + (i * Math.PI / 6);
            const length = 15;
            const bendFactor = Math.sin(Date.now() / 200 + i) * 5;
            
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.quadraticCurveTo(
                Math.cos(angle) * length - bendFactor,
                Math.sin(angle) * length,
                Math.cos(angle) * length * 1.5,
                Math.sin(angle) * length * 1.5
            );
            ctx.stroke();
        }
        
        // Right legs
        for (let i = 0; i < 3; i++) {
            const angle = -Math.PI / 2 - (i * Math.PI / 6);
            const length = 15;
            const bendFactor = Math.sin(Date.now() / 200 + i + 3) * 5;
            
            ctx.beginPath();
            ctx.moveTo(0, 8);
            ctx.quadraticCurveTo(
                Math.cos(angle) * length - bendFactor,
                Math.sin(angle) * length,
                Math.cos(angle) * length * 1.5,
                Math.sin(angle) * length * 1.5
            );
            ctx.stroke();
        }
        
        // Draw antenna
        ctx.strokeStyle = '#00FF66';
        ctx.beginPath();
        ctx.moveTo(15, -2);
        ctx.quadraticCurveTo(
            25, -10 + Math.sin(Date.now() / 500) * 3,
            30, -15 + Math.sin(Date.now() / 500) * 3
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(15, 2);
        ctx.quadraticCurveTo(
            25, 10 + Math.cos(Date.now() / 500) * 3,
            30, 15 + Math.cos(Date.now() / 500) * 3
        );
        ctx.stroke();
        
        // Add glow effect for cyberpunk feel
        const glowRadius = 30 + Math.sin(Date.now() / 1000) * 5;
        const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, glowRadius);
        glow.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
        glow.addColorStop(1, 'rgba(147, 51, 234, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Restore context
        ctx.restore();
    }
    
    // Draw HUD with instructions
    function drawHUD() {
        if (!ctx) return;
        
        ctx.fillStyle = '#00FF66';
        ctx.font = '16px monospace';
        ctx.fillText('Cockroach Run - 2D Mode', 20, 30);
        ctx.fillText('Use WASD or arrow keys to move', 20, 60);
        ctx.fillText('Press Space to jump', 20, 90);
        
        // Draw cyberpunk frame
        ctx.strokeStyle = '#9333EA';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 300, 90);
        
        // Draw scanlines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let y = 0; y < canvas.height; y += 2) {
            ctx.fillRect(0, y, canvas.width, 1);
        }
    }
    
    // Update character movement
    function updateCharacter(deltaTime) {
        const speed = 200 * deltaTime; // pixels per second
        const rotationSpeed = 3 * deltaTime; // radians per second
        
        // Update rotation
        if (keys.left) {
            rotation += rotationSpeed;
        }
        if (keys.right) {
            rotation -= rotationSpeed;
        }
        
        // Calculate movement direction
        const dx = Math.sin(rotation) * speed;
        const dy = Math.cos(rotation) * speed;
        
        // Move forward/backward
        if (keys.up) {
            characterX += dx;
            characterY -= dy;
        }
        if (keys.down) {
            characterX -= dx;
            characterY += dy;
        }
        
        // Jump effect (simple up/down animation)
        if (keys.jump) {
            // Just visual effect in 2D mode
        }
        
        // Keep in bounds
        const margin = 30;
        characterX = Math.max(margin, Math.min(canvas.width - margin, characterX));
        characterY = Math.max(margin, Math.min(canvas.height - margin, characterY));
    }
    
    // 2D animation loop
    function animate2D(timestamp) {
        if (!isRunning) {
            lastTimestamp = timestamp;
            requestAnimationFrame(animate2D);
            return;
        }
        
        // Calculate delta time
        const deltaTime = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        
        // Update character
        updateCharacter(deltaTime);
        
        // Draw scene
        drawGrid();
        drawCockroach();
        drawHUD();
        
        requestAnimationFrame(animate2D);
    }
    
    // Cleanup resources
    function cleanup() {
        // Remove event listeners
        window.removeEventListener('resize', null);
        window.removeEventListener('keydown', null);
        window.removeEventListener('keyup', null);
        
        // Reset flags
        isRunning = false;
    }
    
    // Public API
    return {
        startGame: function(mode, character) {
            console.log("Starting game with mode:", mode || 'default', "character:", character || 'default');
            
            // Get container ready
            container = document.getElementById('game-container');
            if (container) {
                container.style.display = 'block';
            }
            
            // Check if WebGL is supported
            const hasWebGL = detectWebGLContext();
            console.log("WebGL support:", hasWebGL);
            
            // For now, always use 2D since we know it works
            if (init2DGame()) {
                // Reset character position
                characterX = canvas.width / 2;
                characterY = canvas.height / 2;
                
                // Start running
                isRunning = true;
            } else {
                console.error("Failed to initialize game");
                alert("Sorry, there was an error starting the game.");
            }
        },
        
        pauseGame: function() {
            isRunning = false;
        },
        
        resumeGame: function() {
            isRunning = true;
        },
        
        stopGame: function() {
            isRunning = false;
            cleanup();
        }
    };
})();

console.log("Hybrid game engine loaded");
