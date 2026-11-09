import React, { useEffect, useState } from 'react';
import {
  Flame,
  LayoutDashboard,
  Sliders,
  History,
  Settings,
  LogOut,
  Clock,
  Radio,
} from 'lucide-react';
import { TelemetryState } from '../types';
import { warehouseService } from '../services/warehouseService';
import { authService } from '../services/authService';
import { DashboardTab } from './DashboardTab';
import { ControlTab } from './ControlTab';
import { HistoryTab } from './HistoryTab';
import { SettingsTab } from './SettingsTab';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [state, setState] = useState<TelemetryState>(warehouseService.getState());
  const [timeString, setTimeString] = useState('');

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const unsubscribe = warehouseService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      setTimeString(`${h}.${m}.${s} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Kontrol', icon: Sliders },
    { label: 'Histori', icon: History },
    { label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Full-Width Top Navigation Bar */}
      <header className="glass-panel sticky top-0 z-40 border-b shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & MQTT Badge */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-blue-500/25">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-slate-900 dark:text-white">
                  PyroGuard
                </h2>
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase block mt-0.5">
                  IOT MONITORING
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>MQTT Connected</span>
            </div>
          </div>

          {/* Center: Desktop Nav Pills (Icon Only by Default, Text on Active / Hover) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-white/20 dark:border-slate-700/50">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  title={item.label}
                  className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isSelected
                        ? 'max-w-xs opacity-100'
                        : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right: Clock, User Badge & Logout */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Realtime Clock Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{timeString}</span>
            </div>

            {/* User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden xl:inline">
                {currentUser?.name || 'User'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Width Tab Content Container */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-10">
        {activeTab === 0 && <DashboardTab state={state} />}
        {activeTab === 1 && <ControlTab state={state} />}
        {activeTab === 2 && <HistoryTab state={state} />}
        {activeTab === 3 && <SettingsTab state={state} />}
      </main>

      {/* Floating Pill Bottom Navigation Bar on Mobile (Strictly Icon-Only) */}
      <nav className="md:hidden fixed bottom-4 left-6 right-6 z-50 max-w-xs mx-auto glass-pill p-2 rounded-full flex items-center justify-around shadow-2xl transition-all duration-300">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = activeTab === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              title={item.label}
              aria-label={item.label}
              className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center relative ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
