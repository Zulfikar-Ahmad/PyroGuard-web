import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navigation } from './components/Navigation';
import { SkeletonLoader } from './components/SkeletonLoader';
import { DashboardTab } from './pages/DashboardTab';
import { ControlTab } from './pages/ControlTab';
import { HistoryTab } from './pages/HistoryTab';
import { SettingsTab } from './pages/SettingsTab';
import { warehouseService } from './services/warehouseService';
import { TelemetryState } from './types';

export const App: React.FC = () => {
  const [state, setState] = useState<TelemetryState>(warehouseService.getState());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = warehouseService.subscribe((newState) => {
      setState(newState);
      if (loading) {
        setLoading(false);
      }
    });

    const timer = setTimeout(() => setLoading(false), 800);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors relative">
            <Navigation />

            <main className="flex-1 w-full px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-10">
              {loading ? (
                <SkeletonLoader />
              ) : (
                <Routes>
                  <Route path="/" element={<DashboardTab state={state} />} />
                  <Route path="/control" element={<ControlTab state={state} />} />
                  <Route path="/history" element={<HistoryTab state={state} />} />
                  <Route path="/settings" element={<SettingsTab state={state} />} />
                </Routes>
              )}
            </main>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
