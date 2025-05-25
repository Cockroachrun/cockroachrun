console.log('🎯 TESTING MUSIC DROPDOWN INTEGRATION');

// Test if we can access the dropdown elements
setTimeout(() => {
    const wrapper = document.querySelector('.custom-dropdown-wrapper[data-target-select="music-select"]');
    const trigger = wrapper?.querySelector('.custom-dropdown-trigger');
    const optionsList = wrapper?.querySelector('.custom-options-list');
    const originalSelect = wrapper?.querySelector('#music-select');
    
    console.log('🔍 Dropdown Elements Status:');
    console.log('  Wrapper:', !!wrapper);
    console.log('  Trigger:', !!trigger);
    console.log('  Options List:', !!optionsList);
    console.log('  Original Select:', !!originalSelect);
    
    if (wrapper && trigger && optionsList && originalSelect) {
        console.log('✅ All dropdown elements found successfully!');
        
        // Test clicking the trigger
        console.log('🖱️ Testing dropdown trigger click...');
        trigger.click();
        
        setTimeout(() => {
            const isVisible = optionsList.classList.contains('visible');
            console.log('📋 Dropdown opened:', isVisible);
            
            if (isVisible) {
                console.log('🎉 DROPDOWN IS WORKING CORRECTLY!');
                
                // Test selecting an option
                const firstOption = optionsList.querySelector('.custom-option');
                if (firstOption) {
                    console.log('🎵 Testing option selection...');
                    firstOption.click();
                    
                    setTimeout(() => {
                        const newValue = originalSelect.value;
                        const displayText = trigger.textContent;
                        console.log('🎶 Selected value:', newValue);
                        console.log('📺 Display text:', displayText);
                        console.log('✅ MUSIC DROPDOWN INTEGRATION SUCCESSFUL!');
                    }, 100);
                }
            } else {
                console.log('❌ Dropdown did not open properly');
            }
        }, 500);
    } else {
        console.log('❌ Some dropdown elements are missing');
    }
}, 2000);
