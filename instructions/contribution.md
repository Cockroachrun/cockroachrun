# Contribution Guidelines

Thank you for your interest in contributing to Cockroach Run! This document outlines the process for contributing to the project and provides guidelines to maintain code quality and consistency.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Finding Issues to Work On

1. Check the [GitHub Issues](https://github.com/your-username/cockroach-run/issues) page
2. Look for issues labeled as `good first issue` or `help wanted`
3. Comment on an issue to express your interest in working on it
4. Wait for assignment or approval before starting work

### Development Process

1. **Fork the Repository**: Create your own fork of the project
2. **Clone Your Fork**: 
   ```bash
   git clone https://github.com/your-username/cockroach-run.git
   ```
3. **Create a Branch**: 
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Implement Your Changes**: Follow the coding standards and guidelines
5. **Test Your Changes**: Ensure your code works as expected
6. **Commit Your Changes**: Use semantic commit messages
   ```bash
   git commit -m "feat: add new environment collision detection"
   ```
7. **Push Your Changes**: 
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**: Submit your changes for review

## Pull Request Guidelines

When submitting a pull request:

1. **Link Related Issues**: Reference any related issues in your PR description
2. **Describe Your Changes**: Explain what changes you've made and why
3. **Include Screenshots**: For UI changes, include before/after screenshots
4. **Update Documentation**: If your changes affect documentation, update it
5. **Keep PRs Focused**: Each PR should address a single concern or feature
6. **Be Responsive**: Respond to feedback and make requested changes

## Coding Standards

### JavaScript Conventions

- Use ES6+ features where appropriate
- Follow the project's ESLint configuration
- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Document complex functions with JSDoc comments
- Keep functions small and focused on a single responsibility

### Three.js Best Practices

- Dispose of geometries, materials, and textures properly
- Use object pooling for frequently created/destroyed objects
- Minimize draw calls by combining meshes where appropriate
- Use LOD (Level of Detail) for complex models
- Implement proper cleanup in your components

### CSS Guidelines

- Use BEM (Block, Element, Modifier) naming convention
- Keep selectors specific but not overly so
- Group related styles together
- Use variables for consistent colors and dimensions
- Test on multiple screen sizes for responsive designs

## Testing

Before submitting your PR:

- Test on multiple browsers (Chrome, Firefox, Safari)
- Check for console errors and warnings
- Verify performance hasn't degraded
- Ensure code passes linting checks
- Test any UI changes on both desktop and mobile viewports

## Documentation

All contributions should include appropriate documentation:

- Code comments for complex logic
- JSDoc comments for public functions and classes
- README updates for new features or changed behavior
- Examples of usage where appropriate

## Review Process

After submitting a PR:

1. Automated checks will run on your code
2. At least one core contributor will review your changes
3. Feedback may be provided requesting changes
4. Once approved, your PR will be merged

## Recognition

All contributors will be recognized in:

- The project's CONTRIBUTORS.md file
- Release notes when their contributions are included
- The GitHub contributors graph

Thank you for helping make Cockroach Run better! 