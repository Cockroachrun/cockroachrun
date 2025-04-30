// Extremely aggressive message remover
(function nukeMessages() {
  // Function to find and remove the element
  function removeGreenMessages() {
    try {
      // Target the exact element using various selectors
      const specificSelector = 'div[data-component-name="<div />"][style*="color: rgb(0, 255, 102)"]';
      const elements = document.querySelectorAll(specificSelector);
      
      if (elements.length > 0) {
        console.log(`Found ${elements.length} messages to remove`);
        elements.forEach(el => {
          console.log('Removing element:', el);
          el.remove();
        });
      }
      
      // Backup method - remove ANY element that matches part of these criteria
      document.querySelectorAll('div').forEach(el => {
        // Check for style attributes indicating it's our target
        const style = el.getAttribute('style');
        const componentName = el.getAttribute('data-component-name');
        
        if (style && style.includes('color: rgb(0, 255, 102)')) {
          console.log('Removing by style:', el);
          el.remove();
        }
        else if (componentName && componentName.includes('<div />')) {
          console.log('Removing by component name:', el);
          el.remove();
        }
        else if (el.textContent && el.textContent.includes('Click in the game area')) {
          console.log('Removing by text content:', el);
          el.remove();
        }
      });
    } catch (e) {
      console.error('Error removing messages:', e);
    }
  }
  
  // Call the function immediately
  removeGreenMessages();
  
  // Set up interval to keep checking
  const interval = setInterval(removeGreenMessages, 100);
  
  // Also listen for DOM changes
  const observer = new MutationObserver(removeGreenMessages);
  observer.observe(document.body || document.documentElement, { 
    childList: true,
    subtree: true,
    attributes: true
  });
  
  // If that fails, try with a delay
  setTimeout(removeGreenMessages, 500);
  setTimeout(removeGreenMessages, 1000);
  setTimeout(removeGreenMessages, 2000);
})();
