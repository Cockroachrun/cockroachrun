# Cockroach Run - Project Requirements Document

## Overview
Cockroach Run is an immersive 3D web-based game using Three.js that lets players experience the world from a cockroach's perspective. The game features two main modes: a free-roaming exploration mode and an endless runner mode.

## Core Features

### 1. Game Modes
- **Free Runner Mode**: Explore different environments (kitchen, street, bathroom, sewer), interact with objects, and complete objectives
- **Roach Runner Mode**: Endless runner-style gameplay where players navigate through procedurally generated environments, dodging obstacles and collecting resources

### 2. Character System
- Multiple cockroach types with unique abilities:
  - Default Roach: Speed boost ability
  - Stealth Roach: Temporary invisibility (unlockable)
  - Glider Roach: Enhanced jumping/gliding abilities (unlockable)
- Character selection screen with preview and ability descriptions

### 3. Environment System
- Multiple detailed 3D environments:
  - Kitchen environment with countertops, floor areas, cabinets
  - Street environment with sidewalks, drains, trash areas
  - Bathroom environment with tiles, drains, cabinets
  - Sewer environment with pipes, water hazards, tunnels
- Each environment has unique obstacles, collectibles, and objectives

### 4. User Interface
- Loading screen with progress bar and flavor text
- Start screen with game logo and navigation options
- Game mode selection screen
- Character selection screen
- Settings screen for audio, controls, and display options
- Credits screen
- In-game HUD showing health, score, and collected resources
- Pause menu with resume, restart, and quit options

### 5. Cryptocurrency Integration (Optional)
- Bitcoin Ordinals wallet connection (Xverse, Magic Eden)
- Special characters/modes unlockable via wallet connection
- No traditional microtransactions or mandatory wallet requirements

### 6. Audio System
- Background music for menus and different environments
- Sound effects for player actions, collisions, and environmental elements
- Volume controls for music and sound effects

## Technical Requirements

### 1. Performance
- Target frame rate: 60 FPS on desktop, 30+ FPS on mobile
- Progressive asset loading with accurate loading progress
- Optimized 3D models and textures for web performance
- Mobile support with touch controls and performance scaling

### 2. Browser Compatibility
- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- WebGL support required
- Graceful fallbacks for performance limitations

### 3. Responsive Design
- Support for various screen sizes and orientations
- UI scaling for different device resolutions
- Touch input for mobile and mouse/keyboard for desktop

## Visual Style
- Dark, immersive environments with neon highlights
- Cyberpunk aesthetic with glowing elements
- Consistent color palette:
  - Primary: Neon green (#00FF66)
  - Secondary: Purple (#9333EA)
  - Background: Deep black (#121212)
  - Text: Light gray (#E0E0E0)
- Fonts: Orbitron for headings, Exo 2 for body text

## Game Flow
1. User arrives at the site -> Loading screen appears
2. After loading -> Start screen with options
3. User selects 'Play' -> Game mode selection
4. User selects mode -> Character selection
5. User selects character -> Gameplay begins
6. Game ends -> Score screen with replay options

## Future Enhancements (Post-MVP)
- Multiplayer capabilities
- Additional environments and character types
- Achievement system with blockchain integration
- Community features and leaderboards

## Development Priorities
1. Core game loop and 3D rendering system
2. User interface and screen flow
3. Basic gameplay in both modes
4. Audio implementation
5. Additional characters and environments
6. Cryptocurrency integration
7. Performance optimization and testing
8. Polishing and bug fixes 