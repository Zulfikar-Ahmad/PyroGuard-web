import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, ShieldCheck, Thermometer, Droplets, CloudRain, WifiOff } from 'lucide-react';
import { TelemetryState } from '../types';
import { LineChart } from '../components/LineChart';
import { useLanguage } from '../context/LanguageContext';

interface DashboardTabProps {
  state: TelemetryState;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ state }) => {
  const { t } = useLanguage();

  const getStatusConfig = () => {
    if (!state.isDeviceConnected || state.systemStatus === 'Offline') {
      return {
        bgColor: 'bg-slate-500/15 border-slate-500/40 text-slate-600 dark:text-slate-400 shadow-lg shadow-slate-500/10',
        icon: WifiOff,
        title: t('status_offline_title'),
        desc: t('status_offline_desc'),
      };
    } else if (state.systemStatus === 'Bahaya') {
      return {
        bgColor: 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10',
        icon: AlertTriangle,
        title: t('status_danger_title'),
        desc: 'Pendeteksi api / asap mendeteksi bahaya! Sirine darurat aktif.',
      };
    } else if (state.systemStatus === 'Peringatan') {
      return {
        bgColor: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/10',
        icon: ShieldAlert,
        title: t('status_warning_title'),
        desc: 'Suhu atau kadar asap mendekati/melebihi ambang batas normal.',
      };
    }
    return {
      bgColor: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10',
      icon: ShieldCheck,
      title: t('status_safe_title'),
      desc: t('status_safe_desc'),
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const tempProgress = Math.min(1, Math.max(0, (state.temperature - 15) / 35));
  const humProgress = Math.min(1, Math.max(0, state.humidity / 100));
  const smokeProgress = Math.min(1, Math.max(0, state.smoke / 100));
  const flameProgress = state.flameDetected ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Liquid Glass Emergency Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${statusConfig.bgColor}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md">
            <StatusIcon className="w-7 h-7 flex-shrink-0" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-wide">{statusConfig.title}</h3>
            <p className="text-xs opacity-90 mt-0.5">{statusConfig.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10 hidden lg:inline-block">
            {state.mqttTopic}
          </span>
        </div>
      </div>

      {/* Grid 4 Liquid Glass Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Suhu */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-orange-500/40 transition duration-300">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t('sensor_temp')}</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {state.temperature.toFixed(1)} °C
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${tempProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span className="text-slate-500 dark:text-slate-400">
                Max: {state.tempThreshold.toFixed(0)}°C
              </span>
              <span className={`font-bold ${!state.isDeviceConnected ? 'text-slate-400' : state.temperature >= state.tempThreshold ? 'text-red-500' : 'text-emerald-500'}`}>
                {!state.isDeviceConnected ? 'Offline' : state.temperature >= state.tempThreshold ? 'Tinggi' : 'Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Kelembapan */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-sky-500/40 transition duration-300">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t('sensor_hum')}</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {state.humidity.toFixed(0)} % RH
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${humProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span className="text-slate-500 dark:text-slate-400">Ideal: 40% - 70%</span>
              <span className="font-bold text-sky-500">
                {!state.isDeviceConnected ? 'Offline' : state.humidity > 70 ? 'Lembap' : state.humidity < 40 ? 'Kering' : 'Optimum'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Asap */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-purple-500/40 transition duration-300">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t('sensor_smoke')}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {state.smoke.toFixed(0)} % PPM
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${smokeProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span className="text-slate-500 dark:text-slate-400">
                Max: {state.smokeThreshold.toFixed(0)}%
              </span>
              <span className={`font-bold ${!state.isDeviceConnected ? 'text-slate-400' : state.smoke >= state.smokeThreshold ? 'text-red-500' : 'text-purple-500'}`}>
                {!state.isDeviceConnected ? 'Offline' : state.smoke >= state.smokeThreshold ? 'Bahaya' : 'Bersih'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Api */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-red-500/40 transition duration-300">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>{t('sensor_flame')}</span>
            <div className={`p-2 rounded-xl ${state.flameDetected ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className={`text-2xl font-black tracking-tight ${state.flameDetected ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
              {!state.isDeviceConnected ? 'OFFLINE' : state.flameDetected ? t('status_flame_yes') : t('status_flame_no')}
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${!state.isDeviceConnected ? 'bg-slate-400' : state.flameDetected ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-emerald-500'}`}
                style={{ width: `${flameProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span className="text-slate-500 dark:text-slate-400">Sensor Inframerah</span>
              <span className={`font-bold ${!state.isDeviceConnected ? 'text-slate-400' : state.flameDetected ? 'text-red-500' : 'text-emerald-500'}`}>
                {!state.isDeviceConnected ? 'Standby' : state.flameDetected ? 'WASPADA' : 'Aktif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Liquid Glass Chart Panel */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
              Grafik Real-Time Telemetri Gudang
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fluktuasi Suhu (°C) & Kelembapan (%) dari Waktu ke Waktu
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm inline-block" />
              <span className="text-slate-700 dark:text-slate-300 font-bold">Suhu (°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm inline-block" />
              <span className="text-slate-700 dark:text-slate-300 font-bold">Kelembapan (%)</span>
            </div>
          </div>
        </div>
        <div className="h-64 w-full pt-2">
          <LineChart
            tempData={state.tempHistory}
            humData={state.humHistory}
            timeLabels={state.timeHistory}
          />
        </div>
      </div>
    </div>
  );
};
