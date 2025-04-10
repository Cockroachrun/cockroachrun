# Cockroach Run - Frontend Guidelines

## Design System

### Color Palette

#### Primary Colors
- **Neon Green**: `#00FF66` - Primary accent, highlights, important UI elements
- **Purple**: `#9333EA` - Secondary accent, buttons, interactive elements
- **Deep Black**: `#121212` - Main backgrounds, dark areas
- **Light Gray**: `#E0E0E0` - Text, subtle UI elements

#### Secondary Colors
- **Dark Purple**: `#6B21A8` - Button hover states
- **Light Green**: `#86EFAC` - Success states, positive indicators
- **Red**: `#EF4444` - Danger, health low, errors
- **Blue**: `#3B82F6` - Information, special abilities

#### Gradients
- **Neon Gradient**: `linear-gradient(to right, #00FF66, #9333EA)` - Special elements, headers
- **Dark Gradient**: `linear-gradient(to bottom, #121212, #1E1E1E)` - Background variations

### Typography

#### Fonts
- **Headings**: Orbitron (700, 400)
  ```css
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  ```
- **Body Text**: Exo 2 (400, 600)
  ```css
  font-family: 'Exo 2', sans-serif;
  font-weight: 400;
  ```

#### Font Sizes
- **H1**: 2.5rem (40px)
- **H2**: 2rem (32px)
- **H3**: 1.5rem (24px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

#### Line Heights
- **Headings**: 1.2
- **Body**: 1.5

### Spacing

#### Base Unit
- 4px base unit for consistency

#### Spacings
- **Tiny**: 0.25rem (4px)
- **Small**: 0.5rem (8px)
- **Medium**: 1rem (16px)
- **Large**: 1.5rem (24px)
- **X-Large**: 2rem (32px)
- **XX-Large**: 3rem (48px)

### Borders & Shadows

#### Borders
- **Default Border**: 1px solid rgba(147, 51, 234, 0.5) (semi-transparent purple)
- **Highlight Border**: 1px solid #00FF66 (neon green)
- **Border Radius**: 4px (default), 8px (containers), 16px (cards)

#### Shadows
- **Subtle Shadow**: 0 2px 4px rgba(0, 0, 0, 0.3)
- **Medium Shadow**: 0 4px 8px rgba(0, 0, 0, 0.5)
- **Glow Effect**: 0 0 10px rgba(0, 255, 102, 0.7) (green glow)
- **Purple Glow**: 0 0 10px rgba(147, 51, 234, 0.7) (purple glow)

### Animations & Transitions

#### Duration
- **Fast**: 0.2s
- **Medium**: 0.3s
- **Slow**: 0.5s

#### Easing
- **Default**: ease-in-out
- **Bounce**: cubic-bezier(0.68, -0.55, 0.27, 1.55)
- **Sharp**: cubic-bezier(0.33, 1, 0.68, 1)

#### Common Animations
- **Fade In**: Opacity 0 to 1
- **Slide In**: Transform from off-screen
- **Pulse**: Scale animation (1 to 1.05)
- **Glow**: Shadow/opacity animation

## Component Guidelines

### Buttons

#### Primary Button
```css
.button-primary {
  background-color: rgba(0, 0, 0, 0.5);
  color: #E0E0E0;
  border: 1px solid #9333EA;
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
}

.button-primary:hover {
  background-color: #9333EA;
  transform: scale(1.05);
}

.button-primary:active {
  transform: scale(0.98);
}
```

#### Secondary Button
```css
.button-secondary {
  background-color: transparent;
  color: #E0E0E0;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-family: 'Exo 2', sans-serif;
  transition: all 0.2s ease-in-out;
}

.button-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
```

### Cards & Containers

#### Screen Container
```css
.screen-content {
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #9333EA;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
}
```

#### Option Card
```css
.option-card {
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid #9333EA;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease-in-out;
}

.option-card:hover {
  border-color: #00FF66;
  transform: scale(1.02);
}

.option-card.selected {
  border-color: #00FF66;
  border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
}
```

### Form Elements

#### Toggle Switch
```css
.toggle-switch {
  width: 50px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid #9333EA;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
}

.toggle-switch::after {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  background-color: #9333EA;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.2s;
}

.toggle-switch.active::after {
  left: 28px;
  background-color: #00FF66;
}
```

#### Slider
```css
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #9333EA;
  border-radius: 4px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #9333EA;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #9333EA;
  border-radius: 50%;
  cursor: pointer;
}
```

## Layout Guidelines

### Screen Structure
```html
<div id="screen-id" class="screen">
  <div class="screen-content">
    <h1 class="screen-title">Screen Title</h1>
    <div class="screen-body">
      <!-- Content here -->
    </div>
    <div class="button-container">
      <!-- Buttons here -->
    </div>
  </div>
</div>
```

### Flexbox Usage
- Use `display: flex` for one-dimensional layouts
- Use `flex-direction: column` for vertical stacking
- Center content with `align-items: center` and `justify-content: center`
- Use `gap` property for spacing between flex items

### Grid Usage
- Use CSS Grid for two-dimensional layouts
- Use `grid-template-columns` with `repeat()` and `fr` units
- Example:
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

### Responsive Design
- Mobile-first approach with breakpoints for larger screens
- Key breakpoints:
  - Small: 640px
  - Medium: 768px
  - Large: 1024px
  - X-Large: 1280px

```css
/* Mobile (default) */
.container {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

## UI States

### Loading State
- Show progress bar or spinner
- Display relevant loading message
- Provide skip option for non-essential assets

### Empty State
- Clear messaging explaining the empty state
- Guidance on how to proceed
- Visual illustration

### Error State
- Clear error message
- Retry option when applicable
- Fallback content or alternative action

### Interactive States
- Default: Normal appearance
- Hover: Visual feedback (glow, color change, etc.)
- Active/Pressed: Scale slightly smaller, color intensity
- Disabled: Reduced opacity, desaturated colors

## Accessibility Guidelines

### Color Contrast
- Maintain minimum contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Don't rely solely on color to convey information

### Focus States
- Visible focus indicators for keyboard navigation
- Tab order should follow logical flow

### Text Size
- Minimum text size of 16px for body text
- Allow text scaling without breaking layouts

### Screen Reader Support
- Semantic HTML elements (button, nav, etc.)
- ARIA attributes when necessary
- Hidden descriptive text for complex UI elements

## Performance Guidelines

### CSS Best Practices
- Minimize use of expensive properties (box-shadow, border-radius, transforms)
- Use CSS variables for consistent values
- Avoid deeply nested selectors
- Prefer classes over IDs for styling
- Use transform and opacity for animations when possible

### Image Optimization
- Use appropriate formats (WebP when supported)
- Optimize SVGs for size
- Lazy load non-critical images

### Animation Performance
- Use `will-change` for elements that will animate
- Prefer transform and opacity changes
- Use requestAnimationFrame for JavaScript animations
- Avoid layout thrashing (interleaved reads and writes)

## Code Style Guidelines

### CSS Naming Conventions
- Use BEM (Block, Element, Modifier) methodology
- Example:
```css
.button {} /* Block */
.button__icon {} /* Element */
.button--primary {} /* Modifier */
```

### JavaScript Component Structure
```javascript
// component.js
export class Component {
  constructor(options) {
    this.element = this.create();
    this.init(options);
  }
  
  create() {
    // Create and return element
  }
  
  init(options) {
    // Initialize component
  }
  
  // Component methods
}
```

### Documentation
- Comment complex CSS techniques
- Document component APIs and options
- Include usage examples for reusable components 