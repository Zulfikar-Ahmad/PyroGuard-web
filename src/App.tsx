import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardPage } from './pages/DashboardPage';
import { AuthModal } from './components/AuthModal';
import { authService } from './services/authService';
import { User } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <ThemeProvider>
      {currentUser ? (
        <DashboardPage onLogout={handleLogout} />
      ) : (
        <AuthModal isOpen={true} onSuccess={() => {}} />
      )}
    </ThemeProvider>
  );
};

export default App;
