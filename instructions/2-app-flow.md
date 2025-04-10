# Cockroach Run - App Flow Document

## User Journey Map

### 1. Initial Load
User visits site → Loading screen appears → Assets load in background → Loading complete → Transition to Start Screen


### 2. Main Menu Navigation
Start Screen ├── Play Game → Mode Selection Screen ├── Settings → Settings Screen └── Credits → Credits Screen


### 3. Game Mode Selection Flow
Mode Selection Screen ├── Free Runner → Character Selection Screen └── Roach Runner → Character Selection Screen


### 4. Character Selection Flow
Character Selection Screen ├── Default Roach (Always Unlocked) → Start Game ├── Stealth Roach (Locked/Unlocked) → Start Game ├── Glider Roach (Locked/Unlocked) → Start Game └── Back → Return to Mode Selection


### 5. Game Initialization
Character Selected → Environment Loads → Tutorial Tips Display → Game Begins


### 6. Gameplay Loop - Free Runner
Exploration ├── Collect Resources → Update Inventory/Score ├── Complete Objectives → Unlock New Areas ├── Encounter Hazards → Lose Health │ └── Health Reaches Zero → Game Over Screen └── Pause Game → Pause Menu


### 7. Gameplay Loop - Roach Runner
Running ├── Avoid Obstacles → Continue Running ├── Collect Resources → Increase Score ├── Hit Obstacle → Lose Health │ └── Health Reaches Zero → Game Over Screen ├── Use Special Ability → Temporary Effect Active └── Pause Game → Pause Menu


### 8. Pause Menu Flow
Pause Menu ├── Resume → Return to Game ├── Restart → Restart Current Game └── Quit → Return to Start Screen


### 9. Game Over Flow
Game Over Screen ├── Try Again → Restart Game with Same Settings └── Main Menu → Return to Start Screen


### 10. Wallet Connection Flow (Optional)
Start Screen └── Connect Wallet → Wallet Selection Screen ├── Xverse Wallet → Wallet Connection Process │ └── Connection Successful → Unlock Special Content └── Magic Eden → Wallet Connection Process └── Connection Successful → Unlock Special Content


## Screen Transitions

1. **Loading → Start Screen**: Fade transition
2. **Start Screen → Game Modes**: Slide right transition
3. **Game Modes → Character Selection**: Slide right transition
4. **Any Screen → Previous Screen**: Slide left transition
5. **Character Selection → Game**: Fade to black, then fade in game
6. **Game → Pause**: Overlay fade in, game blurs in background
7. **Game → Game Over**: Slow motion effect, then fade to game over screen

## UI Component Hierarchy

App Root ├── Loading Screen ├── Start Screen │ └── Button Container │ ├── Play Button │ ├── Settings Button │ └── Credits Button ├── Game Mode Screen │ ├── Mode Title │ ├── Mode Description │ ├── Mode Options │ │ ├── Free Runner Option │ │ └── Roach Runner Option │ └── Back Button ├── Character Selection Screen │ ├── Character Title │ ├── Character Description │ ├── Character Options │ │ ├── Default Roach │ │ ├── Stealth Roach │ │ └── Glider Roach │ ├── Start Game Button │ └── Back Button ├── Settings Screen │ ├── Audio Settings │ ├── Control Settings │ ├── Graphics Settings │ ├── Save Button │ └── Back Button ├── Credits Screen │ ├── Credits Content │ └── Back Button ├── Game Overlay │ ├── HUD │ │ ├── Health Display │ │ ├── Score Display │ │ └── Special Ability Indicator │ └── Pause Button ├── Pause Screen │ ├── Resume Button │ ├── Restart Button │ └── Quit Button └── Game Over Screen ├── Score Display ├── Try Again Button └── Main Menu Button


## Data Flow

1. **Game State**: Centralized game state object tracks current screen, selected mode, character, game progress
2. **User Settings**: Stored in localStorage for persistence between sessions
3. **Wallet Connection**: Optional external API interaction
4. **Asset Loading**: Progressive loading with state updates to loading screen

## Error Handling Flows

1. **Asset Loading Failure**:
Asset fails to load → Retry loading → If continued failure → Show error message with skip option


2. **Game Error**:
Error during gameplay → Log error → Show minimal error UI → Attempt to continue → If critical → Return to main menu


3. **Wallet Connection Error**:
Connection fails → Show error message → Offer retry → Continue without wallet features


## Accessibility Flow Considerations

1. **Controls**: Multiple control options (keyboard, touch)
2. **Visual**: High contrast mode option
3. **Audio**: Separate volume controls for music and effects with mute option 