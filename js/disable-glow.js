// Disable any potential Three.js bloom effects
document.addEventListener('DOMContentLoaded', () => {
    const disableGlow = () => {
        if (window.THREE && window.effectComposer) {
            window.effectComposer.passes.forEach(pass => {
                if (pass instanceof THREE.UnrealBloomPass) {
                    pass.enabled = false;
                }
            });
        }
    };
    
    // Run now and every second as fallback
    disableGlow();
    setInterval(disableGlow, 1000);
});
