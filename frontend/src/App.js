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

const App = () => {
  const { user } = useAuth();
  console.log('App.js: Current user:', user); // Debug log

  return (
    <Router>
      <Switch>
        {!user && <Route path="/admin-register" component={AdminRegister} />}
        {!user && <Route path="/login" component={Login} />}
        {user ? (
          <div className="flex">
            {user.userType === 'admin' && <Sidebar />}
            <div className="flex-1">
              <Navbar />
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/pos" component={POS} />
                {user.userType === 'admin' ? (
                  <>
                    <Route path="/register" component={Register} />
                    <Route path="/products" component={Products} />
                    <Route path="/stock" component={Stock} />
                    <Route path="/reports" component={Reports} />
                    <Route path="/users" component={Users} />
                  </>
                ) : (
                  <Redirect to="/pos" />
                )}
                <Redirect to={user.userType === 'admin' ? '/dashboard' : '/pos'} />
              </Switch>
            </div>
          </div>
        ) : (
          <Redirect to="/login" />
        )}
      </Switch>
    </Router>
  );
};

export default App;