# Testing Guidelines

This document outlines the testing procedures and best practices for the Cockroach Run project. Comprehensive testing is essential to ensure a smooth, bug-free experience for our users.

## Testing Philosophy

Our testing approach is based on the following principles:

- **Early and Continuous**: Test throughout development, not just at the end
- **Comprehensive Coverage**: Test all critical paths and edge cases
- **Automation First**: Automate tests where possible for consistent verification
- **User-Centric**: Focus on testing the actual user experience
- **Performance Matters**: Test not just functionality, but also performance

## Types of Testing

### 1. Unit Testing

Unit tests verify that individual components work correctly in isolation.

**Tools**: Jest

**Running Unit Tests**:
```bash
npm run test:unit
```

**Guidelines**:
- Each JavaScript module should have corresponding unit tests
- Focus on testing one piece of functionality at a time
- Use mocks for external dependencies (Three.js, DOM APIs)
- Aim for high coverage of critical game logic

**Example Test**:
```javascript
// Testing the cockroach movement logic
describe('Cockroach Movement', () => {
  test('should move forward when W key is pressed', () => {
    const cockroach = new Cockroach();
    const initialPosition = {...cockroach.position};
    cockroach.handleKeyPress('KeyW');
    cockroach.update(0.16); // Simulate 16ms frame
    expect(cockroach.position.z).toBeLessThan(initialPosition.z);
  });
});
```

### 2. Integration Testing

Integration tests verify that multiple components work together correctly.

**Tools**: Jest, Testing Library

**Running Integration Tests**:
```bash
npm run test:integration
```

**Guidelines**:
- Test interactions between game systems (physics, input, rendering)
- Verify that data flows correctly between components
- Test game state transitions (menu → gameplay → game over)

### 3. Performance Testing

Performance tests ensure the game runs smoothly across different devices.

**Tools**: Lighthouse, Custom FPS monitor

**Running Performance Tests**:
```bash
npm run test:performance
```

**Guidelines**:
- Monitor frame rate during gameplay (target: 60 FPS)
- Test asset loading times
- Verify memory usage doesn't grow excessively
- Test on lower-end devices to ensure acceptable performance

### 4. Visual Regression Testing

These tests ensure that UI components and 3D scenes render as expected.

**Tools**: Percy, Storybook

**Running Visual Tests**:
```bash
npm run test:visual
```

**Guidelines**:
- Capture screenshots of key UI components
- Compare renders of 3D environments after changes
- Test different screen sizes and aspect ratios

### 5. Cross-Browser Testing

Verify that the game works across different browsers and platforms.

**Guidelines**:
- Test on Chrome, Firefox, Safari, and Edge (latest versions)
- Test on iOS and Android (mobile browsers)
- Verify WebGL compatibility
- Check for browser-specific rendering issues

### 6. User Acceptance Testing

Manual testing to verify the overall user experience.

**Guidelines**:
- Follow test scripts that cover key user journeys
- Test the full game from start to finish
- Verify all features work as specified in the PRD
- Note any usability issues or friction points

## Test Coverage

We aim for:
- 80%+ unit test coverage for core game logic
- 100% coverage of critical paths (character movement, collision, game state)
- Complete coverage of all UI components

Check current coverage with:
```bash
npm run test:coverage
```

## Continuous Integration

All tests run automatically in our CI pipeline:
- Unit and integration tests run on every PR
- Performance and visual tests run on merges to main
- Coverage reports are generated automatically

## Writing Testable Code

To make testing easier:
- Separate game logic from rendering
- Use dependency injection
- Keep components small and focused
- Avoid global state (use state management patterns)
- Make side effects explicit and mockable

## Bug Reporting

When you find a bug during testing:

1. Create a GitHub issue with the "bug" label
2. Include detailed steps to reproduce
3. Add screenshots or video if relevant
4. Note browser/device information
5. Specify the severity level (Critical, Major, Minor, Trivial)

## Pre-Release Testing Checklist

Before each release:

- [ ] All automated tests pass
- [ ] Performance benchmarks meet targets
- [ ] Manual testing completed on all supported platforms
- [ ] Verify Bitcoin wallet integration functions correctly
- [ ] Check all animations and sound effects
- [ ] Validate responsive design on various screen sizes
- [ ] Test with different control schemes (keyboard, touch, gamepad)

## Test Data

Use the provided test assets and environments for consistent testing:
- Test cockroach character with standard parameters
- Test kitchen environment with known object placement
- Test wallet with mock Bitcoin data 