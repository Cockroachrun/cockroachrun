// Custom Vite plugin to handle errors gracefully and prevent error overlay
const errorHandlerPlugin = () => ({
  name: 'error-handler',
  enforce: 'pre',
  configureServer(server) {
    // Override the error overlay middleware
    server.middlewares.use((req, res, next) => {
      // Prevent error overlay from being served
      if (req.url === '/__vite_ping' || req.url === '/__vite_error_overlay') {
        res.statusCode = 200;
        res.end('{}');
        return;
      }
      next();
    });
  },
  // Handle build errors
  handleHotUpdate({ server }) {
    // Clear any existing error overlay
    server.ws.send({
      type: 'error',
      err: { message: '', stack: '' },
    });
  },
});

export default errorHandlerPlugin;
