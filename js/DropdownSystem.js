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
        
        // Enhanced music selection handling
        if (originalSelect.id === 'music-select' && window.AudioManager) {
          console.log('Changing music track to:', value);
          const trackName = this.textContent;
          
          // Update the game track ID in AudioManager
          window.AudioManager.gameTrackId = value;
          localStorage.setItem('gameTrackId', value);
          
          // Force game music to change and play immediately if in game context
          if (window.AudioManager.inGameContext) {
            window.AudioManager.playMusicInGameContext();
          } else {
            // If not in game context, just change the current track
            window.AudioManager.currentTrackId = value;
          }
          
          // Update now playing indicator if it exists
          const nowPlaying = document.getElementById('now-playing');
          const nowPlayingText = document.getElementById('now-playing-text');
          if (nowPlayingText) {
            nowPlayingText.textContent = trackName;
            if (nowPlaying) nowPlaying.style.display = 'block';
          }
          
          // Double-check that the audio element has the correct source
          if (window.AudioManager.gameMusic) {
            const expectedSrc = `assets/sounds/music/${window.AudioManager.trackMap[value]}`;
            const currentSrc = window.AudioManager.gameMusic.src;
            
            // Check if the source needs updating
            if (!currentSrc || currentSrc.indexOf(window.AudioManager.trackMap[value]) === -1) {
              console.log('Updating audio source to:', expectedSrc);
              window.AudioManager.gameMusic.src = expectedSrc;
              window.AudioManager.gameMusic.load();
              
              // Try to play immediately if not muted and in game context
              if (!window.AudioManager.isMuted && window.AudioManager.inGameContext) {
                window.AudioManager.gameMusic.play()
                  .then(() => console.log('Game track playing after source update'))
                  .catch(e => console.log('Failed to play after src update:', e.message));
              }
            }
          }
          
          console.log(`Music changed to: ${trackName} (${value})`);
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
