import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  /*
   * Server offline mode: Auth gate bypassed so Web App opens directly to Dashboard.
   * Authentication code and components remain preserved in src/services/authService.ts and src/components/AuthModal.tsx.
   */
  return (
    <ThemeProvider>
      <DashboardPage onLogout={() => {}} />
    </ThemeProvider>
  );
};

export default App;
