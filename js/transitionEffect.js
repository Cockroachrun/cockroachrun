function transitionTo(screenId) {
  const overlay = createOverlay();
  spawnRoaches(overlay);
  AudioManager.playScatterSound();

  setTimeout(() => {
    UIManager.showScreen(screenId);
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.addEventListener('transitionend', () => overlay.remove());
    }, 2000);
  }, 350);
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'transition-overlay';
  overlay.classList.add('active');
  document.body.appendChild(overlay);
  return overlay;
}

function spawnRoaches(overlay) {
  const roachCount = Math.floor(Math.random() * 6) + 15;
  
  for (let i = 0; i < roachCount; i++) {
    const roach = document.createElement('img');
    roach.src = `assets/images/animations/cockroaches/roach${Math.floor(Math.random() * 20)}.png`;
    roach.classList.add('roach');

    const x0 = Math.random() < 0.5 ? -70 : window.innerWidth;
    const y0 = Math.random() * window.innerHeight;
    const x1 = x0 < 0 ? window.innerWidth + 70 : -70;
    const y1 = Math.random() * window.innerHeight;
    
    const dx = x1 - x0;
    const dy = y1 - y0;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const duration = 1.8 + Math.random() * 0.4;

    roach.style.setProperty('--x0', x0 + 'px');
    roach.style.setProperty('--y0', y0 + 'px');
    roach.style.setProperty('--x1', x1 + 'px'); 
    roach.style.setProperty('--y1', y1 + 'px');
    roach.style.setProperty('--angle', angle + 'deg');
    roach.style.setProperty('--dur', duration + 's');

    overlay.appendChild(roach);
  }
}

export { transitionTo };