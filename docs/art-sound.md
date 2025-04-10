# Art and Sound Design Document

## Visual Identity

### Art Style
- **Aesthetic**: Dark realism with detailed textures
- **Mood**: Unsettling, atmospheric, with moments of beauty
- **Reference Games**: Limbo, Inside, Resident Evil (for lighting)
- **Color Palette**: Browns, grays, blacks with occasional warm light sources

### Environment Design
- **Kitchen**: Dirty tiles, aging appliances, food waste, warm yellow lighting
- **Bathroom**: Wet surfaces, dripping water, white tiles with grime, cool blue tones
- **Sewer**: Concrete textures, standing water, rust, minimal ambient light
- **Street**: Cracked pavement, trash, storm drains, contrasting day/night lighting

### Character Design
- **Cockroaches**: Anatomically accurate with slight stylization
- **Animation**: Realistic movement patterns based on real insect footage
- **Customization**: Color variations, antenna types, wing options
- **Scale**: Proper perspective to emphasize small size in environments

### UI Design
- **Menus**: Dark metallic frames with amber highlights
- **HUD**: Minimalist, semi-transparent elements
- **Icons**: Simple silhouettes with clear meaning
- **Typography**: Sans-serif for readability, display font for titles

## Audio Identity

### Music Direction
- **Main Theme**: Unsettling ambient with subtle insect-like sounds
- **Exploration Mode**: Atmospheric, tension-building with environmental sounds
- **Runner Mode**: Faster-paced, rhythmic with building intensity
- **Menu Music**: Subdued version of main theme, loop-friendly

### Sound Effects
- **Character**: Skittering, wing fluttering, mandible clicks
- **Environment**: Water drips, appliance hums, wind, street ambience
- **Interactions**: Impact sounds, egg-laying sounds, feeding sounds
- **UI**: Subtle clicks and swooshes for navigation

### Voice Design
- No human dialogue
- Potential narrator for tutorial only
- Insect communication through abstract sounds

## Technical Specifications

### Asset Requirements
- **Textures**: 2K resolution (1024x1024 for mobile), PBR workflow
- **Models**: Low-poly with normal maps, 5000-10000 triangles per environment
- **Animations**: 24fps, bone-based for characters
- **Audio**: 44.1kHz, 16-bit, stereo for music; mono for most SFX

### Style Guide Enforcement
- Reference images for each environment
- Color swatches for consistent palette
- Animation reference videos
- Audio spectrum and volume standards

## Production Pipeline

### Concept Phase
- Mood boards for environments and characters
- Style exploration sketches
- Audio direction samples
- Material and lighting tests

### Production Phase
- Gray box environments for early testing
- Modular asset creation for environment building
- Sound recording and processing
- Texture atlas creation for optimization

### Implementation Phase
- Lighting setup in Three.js
- Material parameter fine-tuning
- Audio implementation with spatial positioning
- Performance optimization for all assets

### Quality Control
- Visual consistency checks
- Audio mixing and balancing
- Performance testing across devices
- Artistic review against style guide 