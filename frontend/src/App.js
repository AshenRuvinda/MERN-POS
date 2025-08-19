import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminRegister from './pages/AdminRegister';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Reports from './pages/Reports';
import Users from './pages/Users';
import useAuth from './hooks/useAuth';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Loading POS System</h2>
      <p className="text-slate-500">Please wait...</p>
    </div>
  </div>
);

// Route protection component
const ProtectedRoute = ({ component: Component, allowedRoles, user, ...rest }) => {
  return (
    <Route 
      {...rest} 
      render={(props) => {
        console.log('ProtectedRoute: Checking access', { user: !!user, userType: user?.userType, allowedRoles });
        
        if (!user) {
          console.log('ProtectedRoute: No user, redirecting to login');
          return <Redirect to="/login" />;
        }
        
        if (!allowedRoles.includes(user.userType)) {
          console.log('ProtectedRoute: User role not allowed', { userType: user.userType, allowedRoles });
          return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-200 max-w-md">
                <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                <p className="text-red-500 mb-6">You don't have permission to access this page.</p>
                <button 
                  onClick={() => window.location.href = user.userType === 'admin' ? '/dashboard' : '/pos'}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Go to {user.userType === 'admin' ? 'Dashboard' : 'POS'}
                </button>
              </div>
            </div>
          );
        }
        
        console.log('ProtectedRoute: Access granted, rendering component');
        return <Component {...props} />;
      }}
    />
  );
};

const App = () => {
  const { user, loading } = useAuth();
  
  console.log('App.js: Current state:', { user: !!user, userType: user?.userType, loading });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('App.js: Still loading auth state');
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Switch>
          {/* Public routes - only accessible when not logged in */}
          {!user && (
            <>
              <Route path="/admin-register" component={AdminRegister} />
              <Route path="/login" component={Login} />
              <Route exact path="/">
                <Redirect to="/login" />
              </Route>
            </>
          )}

          {/* Protected routes - only accessible when logged in */}
          {user && (
            <>
              <div className="flex min-h-screen">
                {/* Show fixed sidebar only for admin users */}
                {user.userType === 'admin' && <Sidebar />}
                
                <div className={`flex-1 flex flex-col min-w-0 ${
                  user.userType === 'admin' ? 'ml-64' : ''
                }`}>
                  <Navbar />
                  <main className="flex-1 overflow-auto">
                    <Switch>
                      {/* Routes accessible by cashier only */}
                      <ProtectedRoute 
                        path="/pos" 
                        component={POS} 
                        allowedRoles={['cashier']} 
                        user={user} 
                      />
                      
                      {/* Admin-only routes */}
                      <ProtectedRoute 
                        path="/dashboard" 
                        component={Dashboard} 
                        allowedRoles={['admin']} 
                        user={user} 
                      />
                      <ProtectedRoute 
                        path="/register" 
                        component={Register} 
                        allowedRoles={['admin']} 
                        user={user} 
                      />
                      <ProtectedRoute 
                        path="/products" 
                        component={Products} 
                        allowedRoles={['admin']} 
                        user={user} 
                      />
                      <ProtectedRoute 
                        path="/stock" 
                        component={Stock} 
                        allowedRoles={['admin']} 
                        user={user} 
                      />
                      <ProtectedRoute 
                        path="/reports" 
                        component={Reports} 
                        allowedRoles={['admin']} 
                        user={user} 
                      />
                      <ProtectedRoute 
                        path="/users" 
                        component={Users} 
                        allowedRoles={['admin']} 
                        user={user} 
                      />
                      
                      {/* Default redirects based on user role */}
                      <Route exact path="/">
                        <Redirect to={user.userType === 'admin' ? '/dashboard' : '/pos'} />
                      </Route>
                      
                      {/* Catch-all redirect */}
                      <Route>
                        <Redirect to={user.userType === 'admin' ? '/dashboard' : '/pos'} />
                      </Route>
                    </Switch>
                  </main>
                </div>
              </div>
            </>
          )}

          {/* Fallback redirect */}
          <Route>
            <Redirect to={user ? (user.userType === 'admin' ? '/dashboard' : '/pos') : '/login'} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;