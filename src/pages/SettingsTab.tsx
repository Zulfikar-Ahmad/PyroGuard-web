import React, { useState } from 'react';
import { Monitor, Sun, Moon, Palette, Thermometer, CloudRain, Save, Check, Clock, Globe } from 'lucide-react';
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
    <div className="space-y-8 max-w-5xl">
      {/* Section Language Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            <span>{t('language')} (Bahasa)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih bahasa tampilan web & aplikasi
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Pilih Bahasa / Language:
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

      {/* Section Theme & Material You */}
      <div className="space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('theme_mode')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih tema terang, gelap, atau ikuti pengaturan sistem.
          </p>
        </div>

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

      <form onSubmit={handleSave} className="space-y-8">
        {/* Feedback Messages */}
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

        {/* Schedule History Auto-Save Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Jadwal Auto-Save History Perhari</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              History disimpan terjadwal otomatis pada jam yang ditentukan (Default: 03:00 AM / Jam 3 Pagi).
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jam Terjadwal Auto-Save (HH:mm)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-500" />
                <input
                  type="time"
                  value={scheduledSaveTime}
                  onChange={(e) => setScheduledSaveTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              📌 Setiap jam <strong className="text-slate-800 dark:text-slate-200 font-bold">{scheduledSaveTime} WIB</strong>, sistem akan merekam snapshot telemetri dan menyimpannya ke Database MariaDB.
            </div>
          </div>
        </div>

        {/* Threshold Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-500" />
              <span>Konfigurasi Ambang Batas Sensor (Threshold)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Atur batas maksimal sensor penentu alarm otomatis & aktuator.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Batas Maksimum Suhu (°C)
              </label>
              <div className="relative">
                <Thermometer className="w-4 h-4 absolute left-3.5 top-3.5 text-orange-500" />
                <input
                  type="number"
                  step="0.1"
                  value={tempThresh}
                  onChange={(e) => setTempThresh(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Batas Maksimum Kadar Asap (%)
              </label>
              <div className="relative">
                <CloudRain className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-500" />
                <input
                  type="number"
                  step="0.1"
                  value={smokeThresh}
                  onChange={(e) => setSmokeThresh(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold text-xs tracking-wide uppercase transition shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('save_config')}</span>
        </button>
      </form>
    </div>
  );
};
