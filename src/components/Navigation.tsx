import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  Sliders,
  History,
  Settings,
  Clock,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Navigation: React.FC = () => {
  const [timeString, setTimeString] = useState('');
  const location = useLocation();
  const { t } = useLanguage();

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
    { path: '/', label: t('nav_dashboard'), icon: LayoutDashboard },
    { path: '/control', label: t('nav_control'), icon: Sliders },
    { path: '/history', label: t('nav_history'), icon: History },
    { path: '/settings', label: t('nav_settings'), icon: Settings },
  ];

  return (
    <>
      {/* Top Header Navigation Bar */}
      <header className="glass-panel sticky top-0 z-40 border-b shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & MQTT Status */}
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

          {/* Center: Desktop Nav Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-white/20 dark:border-slate-700/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'max-w-xs opacity-100'
                        : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Clock */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{timeString}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Pill Bottom Navigation Component on Mobile */}
      <nav className="md:hidden fixed bottom-4 left-6 right-6 z-50 max-w-xs mx-auto glass-pill p-2 rounded-full flex items-center justify-around shadow-2xl transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
