// Final Robust Glow Toggle
class GlowToggle {
    static init() {
        // Wait for critical UI elements
        const maxAttempts = 10;
        let attempts = 0;
        
        const initInterval = setInterval(() => {
            attempts++;
            const container = document.getElementById('settings-container') || 
                           document.querySelector('.settings-menu') ||
                           document.querySelector('.menu-container');
            
            if (container || attempts >= maxAttempts) {
                clearInterval(initInterval);
                if (container) {
                    this.integrateToggle(container);
                } else {
                    this.createFloatingToggle();
                }
                
                // Initialize state
                if (localStorage.getItem('glowEnabled') === 'false') {
                    document.body.classList.add('glow-disabled');
                }
            }
        }, 300);
    }
    
    static integrateToggle(container) {
        const toggle = document.createElement('div');
        toggle.className = 'setting-item glow-toggle';
        toggle.innerHTML = `
            <span class="setting-label">LOGO GLOW</span>
            <label class="switch">
                <input type="checkbox" ${localStorage.getItem('glowEnabled') !== 'false' ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        `;
        
        toggle.querySelector('input').addEventListener('change', (e) => {
            document.body.classList.toggle('glow-disabled', !e.target.checked);
            localStorage.setItem('glowEnabled', e.target.checked);
            
            // Play subtle feedback sound if audio system exists
            if (window.Howler) {
                new Howl({
                    src: ['sfx/toggle.mp3'],
                    volume: 0.3
                }).play();
            }
        });
        
        // Add to container (preferably at bottom)
        container.appendChild(toggle);
    }
    
    static createFloatingToggle() {
        const toggle = document.createElement('div');
        toggle.className = 'floating-glow-toggle';
        toggle.innerHTML = `
            <span>GLOW</span>
            <label class="switch">
                <input type="checkbox" ${localStorage.getItem('glowEnabled') !== 'false' ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        `;
        
        toggle.querySelector('input').addEventListener('change', (e) => {
            document.body.classList.toggle('glow-disabled', !e.target.checked);
            localStorage.setItem('glowEnabled', e.target.checked);
        });
        
        Object.assign(toggle.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1000',
            padding: '10px 15px',
            background: 'rgba(18,18,18,0.9)',
            border: '1px solid #ffaa33',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: '"Exo 2", sans-serif',
            color: '#ffaa33',
            fontSize: '14px'
        });
        
        document.body.appendChild(toggle);
    }
}

// Start initialization
GlowToggle.init();
