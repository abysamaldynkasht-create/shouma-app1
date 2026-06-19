import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ApplyForm from './components/ApplyForm';
import GlowText from './components/GlowText';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

type ViewMode = 'login' | 'apply' | 'admin' | 'glowing_welcome' | 'dashboard';

export default function App() {
  const [view, setView] = useState<ViewMode>('login');
  const [programmerName, setProgrammerName] = useState('حمد الحبسي');

  // URL routing observer to support path /admin or hash #admin
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;

      if (path.includes('/admin') || hash === '#admin' || search.includes('admin')) {
        setView('admin');
      } else if (hash === '#apply') {
        setView('apply');
      } else if (hash === '#dashboard') {
        // If logged in already, allow dashboard, else login
        const loggedIn = sessionStorage.getItem('shouma_logged_in');
        const progName = sessionStorage.getItem('shouma_prog_name');
        if (loggedIn && progName) {
          setProgrammerName(progName);
          setView('dashboard');
        } else {
          setView('login');
        }
      } else {
        // Normal state
        const loggedIn = sessionStorage.getItem('shouma_logged_in');
        const welcomeDone = sessionStorage.getItem('shouma_welcome_done');
        const progName = sessionStorage.getItem('shouma_prog_name');

        if (loggedIn && progName) {
          setProgrammerName(progName);
          if (welcomeDone) {
            setView('dashboard');
          } else {
            setView('glowing_welcome');
          }
        } else {
          setView('login');
        }
      }
    };

    // Run router on first mount
    handleRouting();

    // Listen to hash and popstate changes
    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('popstate', handleRouting);

    return () => {
      window.removeEventListener('hashchange', handleRouting);
      window.removeEventListener('popstate', handleRouting);
    };
  }, []);

  const handleLoginSuccess = (name: string) => {
    setProgrammerName(name);
    sessionStorage.setItem('shouma_logged_in', 'true');
    sessionStorage.setItem('shouma_prog_name', name);
    
    // Switch to glowing welcomer first!
    setView('glowing_welcome');
    // Smoothly push history hash
    window.location.hash = '';
  };

  const handleContinueToDashboard = () => {
    sessionStorage.setItem('shouma_welcome_done', 'true');
    setView('dashboard');
    window.location.hash = 'dashboard';
  };

  const handleLogout = () => {
    sessionStorage.removeItem('shouma_logged_in');
    sessionStorage.removeItem('shouma_welcome_done');
    sessionStorage.removeItem('shouma_prog_name');
    setView('login');
    window.location.hash = '';
  };

  const handleNavigateToApply = () => {
    setView('apply');
    window.location.hash = 'apply';
  };

  const handleNavigateToAdmin = () => {
    setView('admin');
    window.location.hash = 'admin';
  };

  const handleBackToLogin = () => {
    setView('login');
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      {view === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onApplyClick={handleNavigateToApply}
          onAdminClick={handleNavigateToAdmin}
        />
      )}

      {view === 'apply' && (
        <ApplyForm
          onBackToLogin={handleBackToLogin}
        />
      )}

      {view === 'admin' && (
        <AdminPanel
          onBackToLogin={handleBackToLogin}
        />
      )}

      {view === 'glowing_welcome' && (
        <GlowText
          programmerName={programmerName}
          onContinue={handleContinueToDashboard}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          programmerName={programmerName}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
