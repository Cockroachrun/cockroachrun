# Architecture Overview

## Component Structure
- **UI Layer**: Handles all user interface elements
- **Game Core**: Manages game logic and mechanics
- **Rendering Engine**: Three.js implementation for 3D graphics
- **Service Layer**: External integrations (wallet, etc.)

## Data Flow
1. User input → UI Components → Game Core
2. Game Core → Updates game state → Rendering Engine
3. Game Core ↔ Services (as needed)

## State Management
Game state is managed centrally in the game-loop.js file with specific state modules for:
- Player state (position, health, etc.)
- Environment state (objects, obstacles)
- Game progression (scores, unlocks)

## Rendering Pipeline
1. Scene setup in models.js
2. Asset loading and management
3. Animation system integration
4. Camera controls and positioning
5. Lighting and shadow calculations
6. Performance optimization techniques 