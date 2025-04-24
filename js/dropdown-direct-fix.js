/**
 * Emergency dropdown fix - will run immediately without waiting for DOMContentLoaded
 */
(function() {
  console.log('EMERGENCY DROPDOWN FIX RUNNING');
  
  // Force all dropdowns to be visible in the console for debugging
  window.showAllDropdowns = function() {
    const lists = document.querySelectorAll('.custom-options-list');
    console.log('Found option lists:', lists.length);
    lists.forEach(list => {
      list.removeAttribute('hidden');
      list.classList.add('visible');
      list.style.display = 'block';
      list.style.visibility = 'visible';
      list.style.opacity = '1';
      list.style.maxHeight = '200px';
      list.style.zIndex = '9999';
      list.style.pointerEvents = 'auto';
      console.log('Forced visibility on', list);
    });
  };
  
  // Apply direct event handler
  function applyFix() {
    const triggers = document.querySelectorAll('.custom-dropdown-trigger');
    console.log('Found triggers:', triggers.length);
    
    triggers.forEach(trigger => {
      // Direct, inline click handler
      trigger.onclick = function(e) {
        e.stopPropagation();
        console.log('DIRECT CLICK HANDLER FIRED');
        
        const wrapper = this.closest('.custom-dropdown-wrapper');
        const optionsList = wrapper.querySelector('.custom-options-list');
        
        // Remove any hidden attribute
        optionsList.removeAttribute('hidden');
        
        // Toggle visibility directly with styling
        if (optionsList.style.display === 'block') {
          optionsList.style.display = 'none';
          console.log('Hiding dropdown');
        } else {
          // Hide all other dropdowns first
          document.querySelectorAll('.custom-options-list').forEach(list => {
            if (list !== optionsList) {
              list.style.display = 'none';
            }
          });
          
          // Show this one
          optionsList.style.display = 'block';
          optionsList.style.opacity = '1';
          optionsList.style.maxHeight = '200px';
          optionsList.style.zIndex = '9999';
          console.log('Showing dropdown');
        }
        
        return false; // Prevent default
      };
      
      // Mark as processed
      trigger.setAttribute('data-has-direct-click', 'true');
    });
    
    // Add click handlers to options
    document.querySelectorAll('.custom-option').forEach(option => {
      option.onclick = function(e) {
        e.stopPropagation();
        
        const value = this.getAttribute('data-value');
        const wrapper = this.closest('.custom-dropdown-wrapper');
        const trigger = wrapper.querySelector('.custom-dropdown-trigger');
        const selectedText = trigger.querySelector('.selected-option-text');
        const originalSelect = wrapper.querySelector('.original-select');
        const optionsList = wrapper.querySelector('.custom-options-list');
        
        // Update text and value
        selectedText.textContent = this.textContent;
        
        // Update original select if it exists
        if (originalSelect) {
          originalSelect.value = value;
        }
        
        // Hide dropdown
        optionsList.style.display = 'none';
        
        console.log('Option selected:', this.textContent);
        return false;
      };
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
      document.querySelectorAll('.custom-options-list').forEach(list => {
        list.style.display = 'none';
      });
    });
    
    console.log('Direct dropdown fix applied');
  }
  
  // Try to apply immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyFix();
  } else {
    // Otherwise wait for DOM
    document.addEventListener('DOMContentLoaded', applyFix);
  }
  
  // Also apply after a short delay to be sure
  setTimeout(applyFix, 1000);
})();
