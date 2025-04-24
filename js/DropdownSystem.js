console.log('DropdownSystem.js loaded');
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  const dropdownWrappers = document.querySelectorAll('.custom-dropdown-wrapper');
  console.log('Found wrappers:', dropdownWrappers.length);
  dropdownWrappers.forEach((wrapper, i) => {
    console.log(`Wrapper #${i}`, wrapper);
    const trigger = wrapper.querySelector('.custom-dropdown-trigger');
    const optionsList = wrapper.querySelector('.custom-options-list');
    const options = wrapper.querySelectorAll('.custom-option');
    const originalSelect = wrapper.querySelector('.original-select');
    const selectedOptionText = wrapper.querySelector('.selected-option-text');
    console.log('Trigger:', trigger, 'Options List:', optionsList, 'Options:', options, 'Original Select:', originalSelect, 'Selected Option Text:', selectedOptionText);
    if (!trigger || !optionsList) {
      console.error('Missing required elements in dropdown wrapper:', {trigger, optionsList});
      return;
    }

    // Remove hidden attribute to allow CSS-driven visibility
    optionsList.removeAttribute('hidden');

    trigger.addEventListener('click', function(event) {
      console.log('Trigger clicked', event.target);
      event.stopPropagation();
      // Close other dropdowns
      dropdownWrappers.forEach(otherWrapper => {
        if (otherWrapper !== wrapper) {
          const otherTrigger = otherWrapper.querySelector('.custom-dropdown-trigger');
          const otherList = otherWrapper.querySelector('.custom-options-list');
          otherList.classList.remove('visible');
          otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });
      const isVisible = optionsList.classList.contains('visible');
      optionsList.classList.toggle('visible', !isVisible);
      this.setAttribute('aria-expanded', String(!isVisible));
      console.log('Dropdown visibility toggled:', !isVisible);
    });

    options.forEach(option => {
      option.addEventListener('click', function(event) {
        console.log('Option clicked', this, 'Value:', this.getAttribute('data-value'));
        event.stopPropagation();
        const value = this.getAttribute('data-value');
        originalSelect.value = value;
        selectedOptionText.textContent = this.textContent;
        optionsList.classList.remove('visible');
        trigger.setAttribute('aria-expanded', 'false');
        
        // Trigger change event on the select element to notify listeners
        const changeEvent = new Event('change', { bubbles: true });
        originalSelect.dispatchEvent(changeEvent);
        console.log('Change event dispatched for', originalSelect.id, 'with value', value);
        
        // For music selection specifically
        if (originalSelect.id === 'music-select' && window.AudioManager) {
          console.log('Changing music track to:', value);
          window.AudioManager.changeTrack(value);
        }
      });
    });

    document.addEventListener('click', function(event) {
      if (!wrapper.contains(event.target)) {
        optionsList.classList.remove('visible');
        trigger.setAttribute('aria-expanded', 'false');
        console.log('Document click outside dropdown, closing dropdown.');
      }
    });
  });
});
