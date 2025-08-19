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
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-md w-full p-8 text-center">
            <div className="bg-gradient-to-br from-red-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Technical Details (Development Only)
                </summary>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs font-mono text-red-800 overflow-auto max-h-32">
                  <div className="font-semibold mb-2">Error:</div>
                  <div>{this.state.error.toString()}</div>
                </div>
              </details>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
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

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="8" cy="21" r="1"></circle>
          <circle cx="19" cy="21" r="1"></circle>
          <path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Loading POS System</h2>
      <p className="text-slate-400 mb-6">Please wait while we prepare your workspace...</p>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </div>
  </div>
);

// Main App Component with all providers
const AppWithProviders = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Performance logging
      if (process.env.NODE_ENV === 'development') {
        const endTime = performance.now();
        console.log(`🚀 App loaded in ${Math.round(endTime - startTime)}ms`);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

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