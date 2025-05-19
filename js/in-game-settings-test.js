\
// document.addEventListener('DOMContentLoaded', () => {
//     // Create a button to manually toggle the menu for testing
//     const testButton = document.createElement('button');
//     testButton.textContent = 'Toggle In-Game Settings (Test)';
//     testButton.style.position = 'fixed';
//     testButton.style.top = '100px';
//     testButton.style.left = '10px';
//     testButton.style.zIndex = '10000';
//     document.body.appendChild(testButton);

//     testButton.addEventListener('click', () => {
//         if (window.inGameSettingsInstance) {
//             window.inGameSettingsInstance.toggleMenu();
//             console.log('Test button clicked, toggleMenu called on window.inGameSettingsInstance');
//         } else {
//             console.error('window.inGameSettingsInstance not found by test button.');
//         }
//     });

//     // Log ESC key presses at the document level for debugging
//     document.addEventListener('keydown', (event) => {
//         if (event.key === 'Escape') {
//             console.log('ESC key pressed (detected by in-game-settings-test.js)');
//         }
//     });
//     console.log('in-game-settings-test.js loaded and test button/ESC listener added.');
// });

// Minimal version to keep the file but disable functionality:
console.log('in-game-settings-test.js loaded (functionality disabled).');
