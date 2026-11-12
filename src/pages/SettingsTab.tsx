import React, { useState } from 'react';
import { Monitor, Sun, Moon, Palette, Thermometer, Save, Check, Clock, Globe, ArrowLeft, ChevronRight, Settings, Info, Sliders } from 'lucide-react';
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
          <span>Kembali ke Daftar Pengaturan</span>
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

            <div
              onClick={() => setActiveSubpage('system')}
              className="p-5 rounded-2xl glass-card flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition duration-300"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('system_settings')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('system_sub')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
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
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{t('theme_mode')}</h4>

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
                      ? 'Status: Aktif (Android 12+) — Skema warna menyelaraskan wallpaper sistem.'
                      : 'Status: Fallback Seed (Android 6-11) — Material You aktif otomatis pada Android 12+.'}
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
        /* Subpage: System Settings */
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('system_settings')}</h3>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              Konfigurasi berhasil disimpan!
            </div>
          )}

          {/* Schedule */}
          <div className="p-5 rounded-2xl glass-card space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Jadwal Auto-Save History Perhari</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <input
                type="time"
                value={scheduledSaveTime}
                onChange={(e) => setScheduledSaveTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                📌 Setiap jam <strong className="text-slate-800 dark:text-slate-200">{scheduledSaveTime} WIB</strong>, snapshot telemetri otomatis tersimpan ke MariaDB.
              </p>
            </div>
          </div>

          {/* Thresholds */}
          <div className="p-5 rounded-2xl glass-card space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>Konfigurasi Ambang Batas Sensor (Threshold)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Batas Maksimum Suhu (°C)
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
                  Batas Maksimum Kadar Asap (%)
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
              Pilih Bahasa / Select Language:
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
              PyroGuard adalah sistem pemantauan gudang berbasis IoT (ESP32-S3 + Arduino Nano V3) dengan protokol komunikasi MQTT real-time dan penyimpan data histori MariaDB.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
