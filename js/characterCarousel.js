/**
 * Character Carousel for Cockroach Run
 * Mobile-responsive carousel for character selection
 */

// Run when the page loads
document.addEventListener("DOMContentLoaded", function() {
    // Set up carousel
    setupCarousel();
    
    // Also run when clicking mode cards
    document.querySelectorAll(".mode-card").forEach(card => {
        card.addEventListener("click", function() {
            // Small delay to allow screen transition
            setTimeout(setupCarousel, 50);
        });
    });
});

// Main carousel setup function
function setupCarousel() {
    try {
        console.log("Setting up character carousel");
        
        // Get container element
        const characterSelection = document.querySelector(".character-selection");
        if (!characterSelection) {
            console.warn("Character selection container not found");
            return;
        }
        
        // Get original character cards
        const characterCards = document.querySelectorAll(".character-card");
        if (!characterCards.length) {
            console.warn("No character cards found");
            return;
        }
        
        // Get original buttons
        const originalButtonRow = document.querySelector("#character-selection-screen .button-row");
        const originalStartButton = document.getElementById("start-game-button");
        const originalBackButton = document.getElementById("back-from-character");
        
        // Store original HTML and button functions
        const originalHTML = characterSelection.innerHTML;
        const originalStartFunction = originalStartButton ? originalStartButton.onclick : null;
        const originalBackFunction = originalBackButton ? originalBackButton.onclick : null;
        
        // Hide original button row
        if (originalButtonRow) {
            originalButtonRow.style.display = "none";
        }
        
        try {
            // Create carousel HTML
            const carouselHTML = `
                <div class="character-carousel">
                    <button class="carousel-nav prev-button">&lt;</button>
                    
                    <div class="character-card-container">
                        ${Array.from(characterCards).map((card, index) => {
                            return `<div class="character-card ${index === 0 ? "active selected" : ""} ${card.classList.contains("locked") ? "locked" : ""}" 
                                      data-character="${card.getAttribute("data-character")}">
                                ${card.innerHTML}
                            </div>`;
                        }).join("")}
                    </div>
                    
                    <button class="carousel-nav next-button">&gt;</button>
                </div>
                
                <div class="carousel-footer">
                    <button id="start-game-button" class="start-button">START GAME</button>
                    <button id="back-from-character" class="back-button">BACK</button>
                </div>
            `;
            
            // Apply carousel HTML
            characterSelection.innerHTML = carouselHTML;
            
            // Add carousel styles
            const styleSheet = document.createElement("style");
            styleSheet.id = "carousel-styles";
            styleSheet.textContent = `
                .character-carousel {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4%;
                    margin: 5% 0;
                    position: relative;
                    padding: 2% 0;
                    width: 100%;
                    max-width: 600px;
                }
                
                .carousel-nav {
                    width: 12%;
                    max-width: 50px;
                    aspect-ratio: 1/1;
                    border-radius: 50%;
                    background-color: rgba(0,0,0,0.9);
                    color: var(--orange);
                    font-size: clamp(18px, 4vw, 24px);
                    border: 2px solid var(--orange);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 5;
                    transition: all var(--transition-fast);
                }
                
                .carousel-nav:hover {
                    background-color: var(--orange);
                    color: black;
                    transform: scale(1.1);
                }
                
                .character-card-container {
                    position: relative;
                    width: 60%;
                    max-width: 300px;
                    aspect-ratio: 3/4;
                }
                
                .character-carousel .character-card {
                    background-color: rgba(0, 0, 0, 0.85);
                    border: 2px solid var(--orange);
                    border-radius: var(--radius-md);
                    padding: 5% 5%;
                    width: 100%;
                    height: 100%;
                    min-height: 100%;
                    transition: all var(--transition-normal);
                    cursor: pointer;
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    opacity: 0;
                    visibility: hidden;
                    box-shadow: 0 0 20px rgba(255, 144, 0, 0.3);
                    overflow: hidden;
                }
                
                .character-carousel .character-card.active {
                    opacity: 1;
                    visibility: visible;
                    z-index: 2;
                }
                
                .character-carousel .character-image {
                    width: 45%;
                    aspect-ratio: 1/1;
                    max-width: 150px;
                    filter: none;
                    margin-bottom: 3%;
                    margin-top: 5%;
                    display: block;
                }
                
                .character-carousel .character-card h3 {
                    font-size: var(--text-2xl);
                    letter-spacing: 2px;
                    text-shadow: 0 0 5px rgba(255, 144, 0, 0.5);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    width: 100%;
                    text-align: center;
                }
                
                .character-carousel .character-card p {
                    color: var(--orange);
                    margin-bottom: 2%;
                    text-align: center;
                    font-size: var(--text-sm);
                }
                
                .carousel-footer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1vh;
                    margin-top: 0;
                    width: 100%;
                    pointer-events: auto;
                    position: relative;
                    z-index: 50;
                    margin-bottom: 5vh;
                }
                
                .carousel-footer .start-button {
                    font-size: var(--text-lg);
                    padding: 0.5rem 1rem;
                    background-color: rgba(0, 0, 0, 0.75);
                    border: 1px solid var(--orange);
                    width: auto;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    color: var(--orange);
                    text-transform: uppercase;
                    border-radius: var(--radius-sm);
                    white-space: nowrap;
                }
                
                .carousel-footer .back-button {
                    font-size: var(--text-md);
                    padding: 0.4rem 1rem;
                    background-color: rgba(0, 0, 0, 0.75);
                    border: 1px solid var(--orange);
                    width: auto;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    color: var(--orange);
                    text-transform: uppercase;
                    margin-top: 0.5vh;
                    border-radius: var(--radius-sm);
                }
                
                /* Stat bars styling */
                .character-carousel .character-card .stats {
                    width: 90%;
                    margin-top: 2%;
                    margin-bottom: 5%;
                    flex-shrink: 0;
                }
                
                .character-carousel .stat {
                    margin-bottom: 5px;
                }
                
                .character-carousel .stat span {
                    color: var(--orange);
                    margin-bottom: 2px;
                    font-weight: bold;
                    display: block;
                    font-family: var(--font-heading);
                    font-size: var(--text-sm);
                }
                
                .character-carousel .stat-bar {
                    height: 5px;
                    background-color: rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(60, 60, 60, 0.8);
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .character-carousel .stat-fill {
                    background-color: var(--orange);
                    height: 100%;
                }
                
                /* Mobile adjustments */
                @media (max-width: 768px) {
                    .character-carousel .stat {
                        margin-bottom: 4px;
                    }
                    
                    .character-carousel .stat-bar {
                        height: 4px;
                    }
                    
                    .character-carousel .stat span {
                        font-size: calc(var(--text-sm) - 1px);
                    }
                    
                    .character-carousel .character-card h3 {
                        font-size: var(--text-lg);
                        margin-bottom: 5px;
                    }
                    
                    .character-carousel .character-card p {
                        font-size: var(--text-xs);
                        margin-bottom: 3%;
                    }
                    
                    .character-carousel .character-image {
                        margin-bottom: 5%;
                    }
                }
            `;
            
            // Add styles to document
            document.head.appendChild(styleSheet);
            
            // Set up carousel functionality
            const cardContainer = document.querySelector(".character-card-container");
            const cards = document.querySelectorAll(".character-card-container .character-card");
            const prevButton = document.querySelector(".prev-button");
            const nextButton = document.querySelector(".next-button");
            const startButton = document.getElementById("start-game-button");
            const backButton = document.getElementById("back-from-character");
            
            // Add button functionality
            if (startButton) {
                const handleStartGame = function(e) {
                    if (e) e.preventDefault();
                    try {
                        // Get selected character
                        const activeCard = document.querySelector(".character-card.active");
                        if (!activeCard) return;
                        
                        const selectedCharacter = activeCard.getAttribute("data-character");
                        console.log("Selected character:", selectedCharacter);
                        
                        // Store selection
                        if (window.localStorage) {
                            localStorage.setItem("selectedCharacter", selectedCharacter);
                        }
                        
                        // Try multiple approaches to start the game
                        if (originalStartButton && typeof originalStartButton.click === "function") {
                            originalStartButton.click();
                            return;
                        }
                        
                        if (originalStartFunction) {
                            originalStartFunction.call(originalStartButton || startButton);
                            return;
                        }
                        
                        // Fallback: toggle screens
                        document.getElementById("character-selection-screen").classList.remove("active");
                        const gameScreen = document.getElementById("game-screen");
                        if (gameScreen) {
                            gameScreen.classList.add("active");
                        }
                    } catch (e) {
                        console.error("Error starting game:", e);
                    }
                };
                
                // Add event listeners
                startButton.addEventListener("click", handleStartGame);
                startButton.addEventListener("touchend", function(e) {
                    e.preventDefault();
                    handleStartGame(e);
                });
                
                // Make clickable
                startButton.style.position = "relative";
                startButton.style.zIndex = "100";
            }
            
            if (backButton) {
                const handleBack = function(e) {
                    if (e) e.preventDefault();
                    
                    if (originalBackFunction) {
                        originalBackFunction.call(backButton, e);
                        return;
                    }
                    
                    // Fallback: toggle screens
                    document.getElementById("character-selection-screen").classList.remove("active");
                    document.getElementById("mode-selection-screen").classList.add("active");
                };
                
                // Add event listeners
                backButton.addEventListener("click", handleBack);
                backButton.addEventListener("touchend", handleBack);
                
                // Make clickable
                backButton.style.position = "relative";
                backButton.style.zIndex = "100";
            }
            
            // Navigation function
            let currentCardIndex = 0;
            
            function showCard(index) {
                // Hide all cards
                cards.forEach(card => card.classList.remove("active"));
                
                // Show current card
                cards[index].classList.add("active");
                
                // Update index
                currentCardIndex = index;
            }
            
            // Initialize with first card
            showCard(0);
            
            // Navigation events
            if (prevButton) {
                prevButton.addEventListener("click", () => {
                    const newIndex = (currentCardIndex - 1 + cards.length) % cards.length;
                    showCard(newIndex);
                });
            }
            
            if (nextButton) {
                nextButton.addEventListener("click", () => {
                    const newIndex = (currentCardIndex + 1) % cards.length;
                    showCard(newIndex);
                });
            }
            
        } catch (error) {
            console.error("Error setting up carousel:", error);
            
            // Restore original HTML on error
            characterSelection.innerHTML = originalHTML;
            
            // Show original buttons again
            if (originalButtonRow) {
                originalButtonRow.style.display = "";
            }
        }
    } catch (error) {
        console.error("Failed to initialize character carousel:", error);
    }
}
