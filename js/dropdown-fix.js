/**
 * Cockroach Run - Custom Dropdown Fix
 * Standalone script to make custom dropdowns work without relying on UIManager
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dropdown fix script running');
  
  // Get all dropdown triggers
  const triggers = document.querySelectorAll('.custom-dropdown-trigger');
  
  // Add click handler to each trigger
  triggers.forEach(trigger => {
    console.log('Setting up trigger:', trigger);
    
    // Find its parent wrapper and options list
    const wrapper = trigger.closest('.custom-dropdown-wrapper');
    if (!wrapper) {
      console.error('No wrapper found for trigger:', trigger);
      return;
    }
    
    const optionsList = wrapper.querySelector('.custom-options-list');
    if (!optionsList) {
      console.error('No options list found for trigger:', trigger);
      return;
    }
    
    // Track if we've already added a click handler
    if (trigger.getAttribute('data-has-click') === 'true') return;
    
    // Add click handler
    trigger.addEventListener('click', function(event) {
      event.stopPropagation();
      console.log('Dropdown clicked!');
      
      // Toggle visibility
      const isHidden = optionsList.hasAttribute('hidden');
      
      // Close all other dropdowns
      document.querySelectorAll('.custom-options-list').forEach(list => {
        if (list !== optionsList) {
          list.classList.remove('visible');
          list.setAttribute('hidden', '');
        }
      });
      
      // Toggle this dropdown
      if (isHidden) {
        optionsList.classList.add('visible');
        optionsList.removeAttribute('hidden');
      } else {
        optionsList.classList.remove('visible');
        optionsList.setAttribute('hidden', '');
      }
      
      console.log('Dropdown visibility toggled');
    });
    
    // Mark as processed
    trigger.setAttribute('data-has-click', 'true');
    
    console.log('Trigger setup complete');
  });
  
  // Add click handlers to options
  document.querySelectorAll('.custom-option').forEach(option => {
    option.addEventListener('click', function() {
      const value = this.getAttribute('data-value');
      const wrapper = this.closest('.custom-dropdown-wrapper');
      const trigger = wrapper.querySelector('.custom-dropdown-trigger');
      const selectedText = trigger.querySelector('.selected-option-text');
      const originalSelect = wrapper.querySelector('.original-select');
      
      // Update text and value
      selectedText.textContent = this.textContent;
      
      // Update original select if it exists
      if (originalSelect) {
        originalSelect.value = value;
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        originalSelect.dispatchEvent(event);
      }
      
      // Hide dropdown
      const optionsList = wrapper.querySelector('.custom-options-list');
      optionsList.classList.remove('visible');
      optionsList.setAttribute('hidden', '');
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function() {
    document.querySelectorAll('.custom-options-list').forEach(list => {
      list.classList.remove('visible');
      list.setAttribute('hidden', '');
    });
  });
  
  console.log('Dropdown fix script complete');
});
