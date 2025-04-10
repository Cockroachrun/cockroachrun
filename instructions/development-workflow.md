# Development Workflow

## Environment Setup
1. Clone the repository
2. Open the project in Visual Studio Code
3. Use the Live Server extension to preview the game

## Recommended VS Code Extensions
- GitLens
- Prettier
- ESLint
- Live Server
- Path Intellisense
- Code Spell Checker
- Playwright
- Error Lens (recommended)
- Auto Rename Tag (recommended)
- Three.js Snippets (recommended)

## Development Process
1. **Feature Planning**: Document the feature in the appropriate instruction file
2. **Implementation**: 
   - Update HTML structure in index.html
   - Add CSS in the appropriate component file
   - Implement JavaScript functionality in the correct module
3. **Testing**: 
   - Use Live Server to preview changes
   - Test on multiple screen sizes
   - Write Playwright tests for UI components
4. **Code Review**: 
   - Ensure code follows project structure
   - Verify styling matches the original design
   - Check for browser compatibility

## Git Workflow
1. Create a feature branch from main
2. Make small, focused commits
3. Write clear commit messages
4. Create a pull request when feature is complete
5. Merge to main after review

## File Organization Guidelines
- Keep component-specific code grouped together
- Place shared utilities in the utils directory
- Maintain clear separation between game modes 