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
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

// Route protection component
const ProtectedRoute = ({ component: Component, allowedRoles, user, ...rest }) => {
  return (
    <Route 
      {...rest} 
      render={(props) => {
        if (!user) {
          return <Redirect to="/login" />;
        }
        
        if (!allowedRoles.includes(user.userType)) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                <p className="text-red-500">You don't have permission to access this page.</p>
                <button 
                  onClick={() => window.location.href = user.userType === 'admin' ? '/dashboard' : '/pos'}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Go to {user.userType === 'admin' ? 'Dashboard' : 'POS'}
                </button>
              </div>
            </div>
          );
        }
        
        return <Component {...props} />;
      }}
    />
  );
};

const App = () => {
  const { user, loading } = useAuth();
  
  console.log('App.js: Current user:', user);
  console.log('App.js: Loading state:', loading);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Switch>
        {/* Public routes - only accessible when not logged in */}
        {!user && (
          <>
            <Route path="/admin-register" component={AdminRegister} />
            <Route path="/login" component={Login} />
            <Route exact path="/" component={Login} />
          </>
        )}

        {/* Protected routes - only accessible when logged in */}
        {user && (
          <div className="flex min-h-screen">
            {/* Show sidebar only for admin users */}
            {user.userType === 'admin' && <Sidebar />}
            
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1 overflow-auto">
                <Switch>
                  {/* Routes accessible by both admin and cashier */}
                  <ProtectedRoute 
                    path="/pos" 
                    component={POS} 
                    allowedRoles={['admin', 'cashier']} 
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
        )}

        {/* Redirect to login if no matching route and not authenticated */}
        {!user && (
          <Route>
            <Redirect to="/login" />
          </Route>
        )}
      </Switch>
    </Router>
  );
};

export default App;