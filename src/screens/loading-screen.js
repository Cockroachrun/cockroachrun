export const createLoadingScreen = (uiManager) => {
  // Use the existing DOM element
  const element = document.getElementById('loading-screen');
  
  // Get references to progress bar, text, and flavor text in the existing DOM
  const progressBar = element.querySelector('.progress-bar');
  const progressText = element.querySelector('.progress-text');
  const flavorText = element.querySelector('.flavor-text');
  
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
  
  const api = {
    element,
    updateProgress,
    onShow,
    onHide
  };
  console.log('Loading screen module API:', api);
  return api;
}; 