# Cockroach Run – Orange Cyberpunk Theme PRD Update

## 1. Theme & Visual Identity

- **Primary Color:** Neon Orange (`#FF9000`, `#CC7200`, `#FFAA33`)
- **Accent Colors:**  
  - Neon Green (`#00ff41`) and Purple (`#a742f5`) are reserved for alternate themes or legacy components only.  
  - Main UI uses orange for all highlights, glows, borders, and interactive elements.
- **Background:** Deep black/dark gray (`#121212`, `#1a1a1a`)
- **Text:** Light (`#E0E0E0`, `#ff8e00`)
- **Effects:** Orange glows, shadows, and transitions for a cyberpunk/futuristic look.

## 2. UI Components

- **Buttons:**  
  - Orange borders, glows, and hover states.
  - Consistent padding, uppercase, bold fonts.
- **Cards (Character, Mode, etc.):**  
  - Dark backgrounds, orange borders/glows.
  - Locked states: reduced opacity, orange border or overlay.
- **Menus & HUD:**  
  - Orange highlights for active/selected items.
  - Score and HUD elements use orange for emphasis.

## 3. Accessibility & Responsiveness

- All components are mobile-responsive.
- Keyboard navigation and focus states are visible with orange glows or borders.

## 4. Audio/Interaction

- UI navigation (e.g., carousel arrows) triggers sound effects using the AudioManager.
- Sounds should match the cyberpunk vibe (e.g., synthy, digital blips).

## 5. Modularity & Maintainability

- All theme colors are defined as CSS variables for easy updates.
- Orange is the default; alternate themes can override variables as needed.
- No global namespace pollution in JS; all UI logic is modular.

## 6. Legacy/Alternate Themes

- Neon green and purple are still defined for alternate themes, but are not used in the main UI.
- If switching themes, update the CSS variable overrides accordingly.

---

**Summary:**  
The default Cockroach Run experience is now a unified orange cyberpunk theme. All UI elements, effects, and interactions reflect this palette for a cohesive, modern, and visually striking look.
