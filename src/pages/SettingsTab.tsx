import React, { useState } from 'react';
import { Monitor, Sun, Moon, Palette, Wifi, Lock, Thermometer, CloudRain, Save, Check } from 'lucide-react';
import { TelemetryState } from '../types';
import { useTheme } from '../context/ThemeContext';
import { warehouseService } from '../services/warehouseService';

interface SettingsTabProps {
  state: TelemetryState;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ state }) => {
  const { themeMode, setThemeMode, isDynamicColorAvailable } = useTheme();

  const [ssid, setSsid] = useState(state.wifiSsid);
  const [pass, setPass] = useState(state.wifiPass);
  const [tempThresh, setTempThresh] = useState(state.tempThreshold.toString());
  const [smokeThresh, setSmokeThresh] = useState(state.smokeThreshold.toString());
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

    if (!ssid.trim()) {
      setErrorMsg('SSID Wi-Fi tidak boleh kosong!');
      return;
    }

    warehouseService.updateSettings(tempVal, smokeVal, ssid.trim(), pass.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Section Theme & Material You */}
      <div className="space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Tampilan & Tema Aplikasi</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih tema terang, gelap, atau ikuti pengaturan sistem (Mendukung Material You di Android 12+).
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-5">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Mode Tema</h4>

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
              <span>Sistem</span>
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
              <span>Terang</span>
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
              <span>Gelap</span>
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
            Konfigurasi Wi-Fi & Ambang Batas (Threshold) berhasil disimpan!
          </div>
        )}

        {/* Wi-Fi Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Konfigurasi Jaringan Wi-Fi ESP32-S3
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atur SSID dan Password jaringan Wi-Fi yang akan dihubungkan oleh ESP32-S3.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                SSID / Nama Wi-Fi
              </label>
              <div className="relative">
                <Wifi className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-500" />
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Nama Wi-Fi"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password Wi-Fi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-500" />
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Password Wi-Fi"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Threshold Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Konfigurasi Ambang Batas (Threshold)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengaturan batas maksimal sensor yang akan mentrigger alarm otomatis & aktuator.
            </p>
          </div>

          <div className="space-y-4">
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
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold text-xs tracking-wide uppercase transition shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Simpan Konfigurasi
        </button>
      </form>
    </div>
  );
};
