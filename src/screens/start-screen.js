import { getEngine } from '../core/engine.js';

export const createStartScreen = (uiManager) => {
  // Create the screen element
  const element = document.createElement('div');
  element.id = 'start-screen';
  element.className = 'screen';
  
  // Apply cyberpunk style using the design guidelines
  element.style.background = 'linear-gradient(to bottom, #121212, #1E1E1E)';
  element.style.color = '#E0E0E0';
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'screen-content';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.alignItems = 'center';
  content.style.justifyContent = 'center';
  content.style.textAlign = 'center';
  content.style.width = '90%';
  content.style.maxWidth = '600px';
  content.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  content.style.borderRadius = '8px';
  content.style.border = '1px solid #9333EA';
  content.style.padding = '2rem';
  
  // Create title
  const title = document.createElement('h1');
  title.textContent = 'COCKROACH RUN';
  title.style.color = '#00FF66';
  title.style.fontFamily = 'Orbitron, sans-serif';
  title.style.fontSize = '2.5rem';
  title.style.textTransform = 'uppercase';
  title.style.marginBottom = '1rem';
  title.style.textShadow = '0 0 10px rgba(0, 255, 102, 0.7)';
  content.appendChild(title);
  
  // Create subtitle
  const subtitle = document.createElement('p');
  subtitle.textContent = 'A cyberpunk cockroach adventure';
  subtitle.style.fontFamily = 'Exo 2, sans-serif';
  subtitle.style.fontSize = '1.2rem';
  subtitle.style.marginBottom = '3rem';
  subtitle.style.opacity = '0.8';
  content.appendChild(subtitle);
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'column';
  buttonContainer.style.gap = '1rem';
  buttonContainer.style.width = '100%';
  buttonContainer.style.maxWidth = '300px';
  content.appendChild(buttonContainer);
  
  // Helper function to create buttons
  const createButton = (text, clickHandler) => {
    const button = document.createElement('button');
    button.className = 'button';
    button.textContent = text;
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    button.style.color = '#E0E0E0';
    button.style.border = '1px solid #9333EA';
    button.style.borderRadius = '4px';
    button.style.padding = '0.8rem 1.5rem';
    button.style.fontFamily = 'Orbitron, sans-serif';
    button.style.fontSize = '1rem';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.2s ease-in-out';
    button.style.textTransform = 'uppercase';
    
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#9333EA';
      button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', clickHandler);
    return button;
  };
  
  // Create play button
  const playButton = createButton('PLAY', () => {
    console.log('Play button clicked');
    // Will navigate to mode selection screen when implemented
    // For now, start the engine to show the 3D scene
    getEngine().start();
  });
  buttonContainer.appendChild(playButton);
  
  // Create settings button
  const settingsButton = createButton('SETTINGS', () => {
    console.log('Settings button clicked');
    // Will navigate to settings screen when implemented
  });
  buttonContainer.appendChild(settingsButton);
  
  // Create credits button
  const creditsButton = createButton('CREDITS', () => {
    console.log('Credits button clicked');
    // Will navigate to credits screen when implemented
  });
  buttonContainer.appendChild(creditsButton);
  
  // Create wallet connect button (optional feature)
  const walletButton = createButton('CONNECT WALLET', () => {
    console.log('Wallet button clicked');
    // Will implement wallet connection when ready
  });
  walletButton.style.marginTop = '2rem';
  walletButton.style.opacity = '0.7';
  buttonContainer.appendChild(walletButton);
  
  // Version text
  const versionText = document.createElement('div');
  versionText.textContent = 'v0.1.0 Alpha';
  versionText.style.fontFamily = 'Exo 2, sans-serif';
  versionText.style.fontSize = '0.8rem';
  versionText.style.opacity = '0.5';
  versionText.style.marginTop = '3rem';
  content.appendChild(versionText);
  
  // Add content to element
  element.appendChild(content);
  
  // Background animation effect (subtle pulse)
  let animationFrame;
  
  const animateBackground = () => {
    let time = 0;
    
    const animate = () => {
      time += 0.01;
      const borderColor = `rgba(147, 51, 234, ${0.5 + Math.sin(time) * 0.2})`;
      const shadowColor = `0 0 ${10 + Math.sin(time) * 5}px rgba(0, 255, 102, ${0.3 + Math.sin(time) * 0.1})`;
      
      content.style.borderColor = borderColor;
      title.style.textShadow = shadowColor;
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  // Event handlers
  const onShow = () => {
    animateBackground();
    if (window.AudioManager && typeof window.AudioManager.playMenuMusic === 'function') {
      window.AudioManager.playMenuMusic();
    }
  };
  
  const onHide = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
  
  return {
    element,
    onShow,
    onHide
  };
};
