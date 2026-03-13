/**
 * Global error handler to suppress browser extension errors
 * These errors are harmless and don't affect application functionality
 */

// Suppress "disconnected port" errors from browser extensions
window.addEventListener('error', (event) => {
  // Check if error is from browser extension (proxy.js)
  if (
    event.message &&
    (event.message.includes('disconnected port') ||
     event.message.includes('proxy.js') ||
     event.filename?.includes('proxy.js') ||
     event.filename?.includes('chrome-extension://'))
  ) {
    // Suppress the error - it's from a browser extension, not our code
    event.preventDefault();
    console.debug('[Suppressed] Browser extension error:', event.message);
    return true;
  }
  // Let other errors through normally
  return false;
});

// Suppress unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    (event.reason.message?.includes('disconnected port') ||
     event.reason.message?.includes('proxy.js'))
  ) {
    event.preventDefault();
    console.debug('[Suppressed] Browser extension promise rejection:', event.reason);
    return true;
  }
  return false;
});

// Override console.error to filter extension errors (optional, more aggressive)
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorString = args.join(' ');
  if (
    errorString.includes('disconnected port') ||
    errorString.includes('proxy.js') ||
    errorString.includes('chrome-extension://')
  ) {
    // Silently ignore or use console.debug
    console.debug('[Suppressed Extension Error]', ...args);
    return;
  }
  // Call original console.error for real errors
  originalConsoleError.apply(console, args);
};
