export const createLoadingScreen = (uiManager) => {
  // Create the screen element
  const element = document.createElement('div');
  element.id = 'loading-screen';
  element.className = 'screen';
  
  // Apply cyberpunk style using the design guidelines
  element.style.background = 'linear-gradient(to bottom, #121212, #1E1E1E)';
  element.style.color = '#E0E0E0';
  
  // Create loading content
  const content = document.createElement('div');
  content.className = 'loading-content';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.alignItems = 'center';
  content.style.justifyContent = 'center';
  content.style.textAlign = 'center';
  content.style.width = '80%';
  content.style.maxWidth = '600px';
  
  // Create logo
  const logo = document.createElement('h1');
  logo.textContent = 'COCKROACH RUN';
  logo.style.color = '#00FF66';
  logo.style.fontFamily = 'Orbitron, sans-serif';
  logo.style.fontSize = '2.5rem';
  logo.style.textTransform = 'uppercase';
  logo.style.marginBottom = '2rem';
  logo.style.textShadow = '0 0 10px rgba(0, 255, 102, 0.7)';
  content.appendChild(logo);
  
  // Create progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  progressContainer.style.width = '100%';
  progressContainer.style.height = '20px';
  progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  progressContainer.style.borderRadius = '4px';
  progressContainer.style.border = '1px solid #9333EA';
  progressContainer.style.overflow = 'hidden';
  progressContainer.style.marginBottom = '1rem';
  content.appendChild(progressContainer);
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.height = '100%';
  progressBar.style.width = '0%';
  progressBar.style.backgroundColor = '#00FF66';
  progressBar.style.transition = 'width 0.3s ease-in-out';
  progressContainer.appendChild(progressBar);
  
  // Create progress text
  const progressText = document.createElement('div');
  progressText.className = 'progress-text';
  progressText.textContent = 'Loading... 0%';
  progressText.style.fontFamily = 'Exo 2, sans-serif';
  progressText.style.marginTop = '0.5rem';
  content.appendChild(progressText);
  
  // Create flavor text
  const flavorText = document.createElement('p');
  flavorText.className = 'flavor-text';
  flavorText.textContent = 'Preparing for infestation...';
  flavorText.style.fontFamily = 'Exo 2, sans-serif';
  flavorText.style.fontStyle = 'italic';
  flavorText.style.marginTop = '2rem';
  flavorText.style.opacity = '0.7';
  content.appendChild(flavorText);
  
  // Add content to element
  element.appendChild(content);
  
  // List of flavor texts to cycle through
  const flavorTexts = [
    'Preparing for infestation...',
    'Polishing antennae...',
    'Triggering human disgust reactions...',
    'Calculating escape routes...',
    'Analyzing kitchen layouts...',
    'Optimizing scurrying algorithms...',
    'Rendering cybernetic exoskeletons...',
    'Synchronizing survival instincts...'
  ];
  
  // Function to change flavor text randomly
  let flavorTextInterval;
  
  const startFlavorTextCycle = () => {
    let currentIndex = 0;
    flavorTextInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % flavorTexts.length;
      flavorText.textContent = flavorTexts[currentIndex];
    }, 3000);
  };
  
  // Function to update progress bar
  const updateProgress = (progress) => {
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Loading... ${progress}%`;
  };
  
  // Event handlers
  const onShow = () => {
    startFlavorTextCycle();
  };
  
  const onHide = () => {
    if (flavorTextInterval) {
      clearInterval(flavorTextInterval);
    }
  };
  
  return {
    element,
    updateProgress,
    onShow,
    onHide
  };
}; 