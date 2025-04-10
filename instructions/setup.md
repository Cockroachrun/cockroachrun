# Cockroach Run - Development Setup Guide

This guide will help you set up your development environment for contributing to the Cockroach Run project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14+) and npm (v7+)
- **Git** for version control
- **Visual Studio Code** (recommended editor)
- A modern web browser with WebGL support (Chrome, Firefox, Edge recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cockroach-run.git
cd cockroach-run
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

This will start a local development server using Vite. The game should automatically open in your default browser at `http://localhost:3000`.

## Recommended VS Code Extensions

For the best development experience, we recommend installing the following VS Code extensions:

- **ESLint** - For JavaScript linting
- **Prettier** - For code formatting
- **Live Server** - For static file serving
- **Three.js Snippets** - For Three.js code snippets
- **WebGL GLSL Editor** - For shader editing
- **GitHub Pull Requests and Issues** - For GitHub integration

## Project Structure

```
cockroach-run/
├── assets/           # Game assets (models, textures, sounds)
├── css/              # CSS stylesheets
├── docs/             # Project documentation
├── instructions/     # Detailed guides and tutorials
├── js/               # JavaScript source files
│   ├── components/   # Reusable game components
│   ├── core/         # Core game engine
│   ├── entities/     # Game entities
│   ├── environments/ # 3D environments
│   ├── ui/           # User interface elements
│   └── utils/        # Utility functions
├── .github/          # GitHub templates and workflows
├── index.html        # Main HTML file
└── package.json      # Project dependencies and scripts
```

## Development Workflow

1. **Create a Branch**: Always create a new branch for your work
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**: Implement your changes following our coding guidelines

3. **Test Your Changes**: Ensure your changes work properly
   ```bash
   npm run test
   ```

4. **Commit Your Changes**: Use descriptive commit messages
   ```bash
   git commit -m "feat: add new cockroach character variant"
   ```

5. **Push Your Branch**: Push your changes to GitHub
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**: Open a PR on GitHub for review

## Environment Configuration

The project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# Development mode
NODE_ENV=development

# API endpoints (optional for backend integration)
API_URL=http://localhost:5000

# Bitcoin wallet integration settings (required for Ordinals features)
WALLET_PROVIDER_URL=https://blockstream.info/testnet/api

# Analytics settings (optional)
ENABLE_ANALYTICS=false
```

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate optimized files in the `dist/` directory.

## Troubleshooting

### Common Issues

1. **WebGL not working**
   - Ensure your graphics drivers are up to date
   - Check browser support at [WebGL Report](https://webglreport.com)

2. **Assets not loading**
   - Check browser console for CORS errors
   - Ensure paths are correct (case-sensitive)

3. **Performance issues**
   - Reduce texture sizes or model complexity
   - Use the browser's performance tools to identify bottlenecks

### Getting Help

If you encounter problems not covered here:

- Check existing GitHub issues or create a new one
- Consult the documentation in the `/docs` directory
- Reach out on the project Discord channel 