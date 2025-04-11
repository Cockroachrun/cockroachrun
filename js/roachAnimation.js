/**
 * Cockroach Run - Roach Animation Module
 * Handles loading and animating cockroach frames on the menu screen
 */

const RoachAnimation = {
    canvas: document.getElementById('roach-animation-canvas'),
    ctx: null,
    frames: [],
    currentFrame: 0,
    animationInterval: null,

    init() {
        this.ctx = this.canvas.getContext('2d');
        this.loadFrames();
        console.log('RoachAnimation initialized');
    },

    loadFrames() {
        for (let i = 1; i <= 9; i++) {
            const img = new Image();
            img.src = `assets/images/animations/frames/Cockroach_0${i}.png`;
            this.frames.push(img);
        }
    },

    startAnimation() {
        if (this.animationInterval) return;
        this.animationInterval = setInterval(() => {
            this.drawFrame();
        }, 100); // 10 FPS
    },

    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    },

    drawFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.frames[this.currentFrame], 0, 0, this.canvas.width, this.canvas.height);
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    },

    updateVisibility(isVisible) {
        this.canvas.style.display = isVisible ? 'block' : 'none';
        if (isVisible) {
            this.startAnimation();
        } else {
            this.stopAnimation();
        }
    }
};

window.RoachAnimation = RoachAnimation;