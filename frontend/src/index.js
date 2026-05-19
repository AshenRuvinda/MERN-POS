import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';
import { AuthProvider } from './context/AuthContext';

// Performance monitoring
const startTime = performance.now();

// Error Boundary Component
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error: error });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-black bg-white p-8 text-center shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-black" />
            
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-black">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-black mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-black mb-2">
                  Technical Details (Development Only)
                </summary>
                <div className="bg-gray-50 border border-black rounded-lg p-3 text-xs font-mono text-black overflow-auto max-h-32">
                  <div className="font-semibold mb-2">Error:</div>
                  <div>{this.state.error.toString()}</div>
                </div>
              </details>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-900 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                className="flex-1 border border-black text-black py-3 px-4 rounded-xl font-medium hover:bg-black hover:text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component with all providers
const AppWithProviders = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      console.log(`🚀 App loaded in ${Math.round(endTime - startTime)}ms`);
    }
  }, []);

  return (
    <StrictMode>
      <AppErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppErrorBoundary>
    </StrictMode>
  );
};

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Service Worker registration (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Development tools
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 POS System - Development Mode');
  
  // React Developer Tools detection
  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('🔧 React DevTools detected');
  }
}

// Render the application
ReactDOM.render(<AppWithProviders />, document.getElementById('root'));

// Hot Module Replacement support
if (module.hot) {
  module.hot.accept('./App', () => {
    console.log('🔄 Hot reloading App component');
    ReactDOM.render(<AppWithProviders />, document.getElementById('root'));
  });
}