import React, { useState } from 'react';
import { Monitor, Sun, Moon, Palette, Thermometer, Save, Check, Clock, Globe, ArrowLeft, ChevronRight, Settings, Info, Sliders, Lock } from 'lucide-react';
import { TelemetryState } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { warehouseService } from '../services/warehouseService';

interface SettingsTabProps {
  state: TelemetryState;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ state }) => {
  const { themeMode, setThemeMode, isDynamicColorAvailable } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [activeSubpage, setActiveSubpage] = useState<string | null>(null);

  // Settings form states
  const [tempThresh, setTempThresh] = useState(state.tempThreshold.toString());
  const [smokeThresh, setSmokeThresh] = useState(state.smokeThreshold.toString());

  // Schedule State
  const [scheduledSaveTime, setScheduledSaveTime] = useState(state.scheduledSaveTime);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const tempVal = parseFloat(tempThresh);
    const smokeVal = parseFloat(smokeThresh);

    if (isNaN(tempVal) || tempVal <= 0 || tempVal > 100) {
      setErrorMsg('Batas suhu harus berupa angka valid antara 1 - 100 °C!');
      return;
    }

    if (isNaN(smokeVal) || smokeVal <= 0 || smokeVal > 100) {
      setErrorMsg('Batas kadar asap harus berupa angka valid antara 1 - 100 %!');
      return;
    }

    if (!scheduledSaveTime.trim()) {
      setErrorMsg('Jadwal simpan history tidak boleh kosong!');
      return;
    }

    warehouseService.updateSettings({
      tempThreshold: tempVal,
      smokeThreshold: smokeVal,
      mqttHost: state.mqttHost,
      mqttPort: state.mqttPort,
      mqttTopic: state.mqttTopic,
      mqttUser: state.mqttUser,
      mqttPass: state.mqttPass,
      mysqlApiEndpoint: state.mysqlApiEndpoint,
      mysqlDbHost: state.mysqlDbHost,
      mysqlDbPort: state.mysqlDbPort,
      mysqlDbName: state.mysqlDbName,
      mysqlDbUser: state.mysqlDbUser,
      mysqlDbPass: state.mysqlDbPass,
      scheduledSaveTime: scheduledSaveTime.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Subpage Header with Back Arrow when active */}
      {activeSubpage && (
        <button
          onClick={() => setActiveSubpage(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_settings')}</span>
        </button>
      )}

      {activeSubpage === null ? (
        /* Main Category Tiles (iOS/Android Native Style) */
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('settings_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings_sub')}</p>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => setActiveSubpage('appearance')}
              className="p-5 rounded-2xl glass-card flex items-center justify-between cursor-pointer hover:border-blue-500/40 transition duration-300"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('appearance')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('appearance_sub')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* System Settings - Greyed out / Locked for Web */}
            <div
              className="p-5 rounded-2xl glass-card flex items-center justify-between opacity-60 border-slate-300 dark:border-slate-800 select-none cursor-not-allowed"
              title="Fitur konfigurasi sistem hanya dapat diakses melalui Aplikasi Mobile (App Only)"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-slate-500/10 text-slate-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('system_settings')}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
                      <Lock className="w-3 h-3" />
                      APP ONLY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('system_sub')}</p>
                </div>
              </div>
              <Lock className="w-5 h-5 text-slate-400" />
            </div>

            <div
              onClick={() => setActiveSubpage('language')}
              className="p-5 rounded-2xl glass-card flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition duration-300"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('language')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('language_sub')} ({language})</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>

            <div
              onClick={() => setActiveSubpage('about')}
              className="p-5 rounded-2xl glass-card flex items-center justify-between cursor-pointer hover:border-orange-500/40 transition duration-300"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('about')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('about_sub')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      ) : activeSubpage === 'appearance' ? (
        /* Subpage: Appearance */
        <div className="space-y-4 animate-fade-in">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('appearance')}</h3>

          <div className="p-6 rounded-2xl glass-card space-y-5">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{t('THEME_MODE')}</h4>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
                  themeMode === 'system'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>{t('theme_system')}</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
                  themeMode === 'light'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{t('theme_light')}</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
                  themeMode === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t('theme_dark')}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">Material You (Dynamic Color)</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isDynamicColorAvailable
                      ? t('material_you_active')
                      : t('material_you_fallback')}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-extrabold px-3 py-1 rounded-full border flex-shrink-0 ${
                  isDynamicColorAvailable
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20'
                }`}
              >
                {isDynamicColorAvailable ? 'ANDROID 12+' : 'ANDROID 6-11'}
              </span>
            </div>
          </div>
        </div>
      ) : activeSubpage === 'system' ? (
        /* Subpage: System Settings (App Only) */
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in opacity-60 pointer-events-none select-none">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center justify-between">
            <span>{t('system_settings')}</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              Akses Khusus Aplikasi Mobile (App Only)
            </span>
          </h3>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              {t('save_success')}
            </div>
          )}

          {/* Schedule */}
          <div className="p-5 rounded-2xl glass-card space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{t('auto_save_schedule_title')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <input
                type="time"
                value={scheduledSaveTime}
                onChange={(e) => setScheduledSaveTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('auto_save_desc_prefix')} <strong className="text-slate-800 dark:text-slate-200">{scheduledSaveTime}</strong> {t('auto_save_desc_suffix')}
              </p>
            </div>
          </div>

          {/* Thresholds */}
          <div className="p-5 rounded-2xl glass-card space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>{t('threshold_title')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('max_temp_label')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempThresh}
                  onChange={(e) => setTempThresh(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('max_smoke_label')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={smokeThresh}
                  onChange={(e) => setSmokeThresh(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold text-xs uppercase transition shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{t('save_config')}</span>
          </button>
        </form>
      ) : activeSubpage === 'language' ? (
        /* Subpage: Language */
        <div className="space-y-4 animate-fade-in">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('language')}</h3>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('select_lang_label')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full px-4 py-3 rounded-2xl glass-card text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="System">🌐 Default System</option>
              <option value="English">🇺🇸 English</option>
              <option value="Indonesian">🇮🇩 Bahasa Indonesia</option>
              <option value="Japanese">🇯🇵 日本語 (Japanese)</option>
            </select>
          </div>
        </div>
      ) : activeSubpage === 'about' ? (
        /* Subpage: About */
        <div className="space-y-4 animate-fade-in">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('about')}</h3>

          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">PyroGuard IoT v1.0</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Smart Warehouse Telemetry & Emergency Command Center</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('about_desc')}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
