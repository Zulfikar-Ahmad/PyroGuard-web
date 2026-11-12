import React from 'react';
import { Cpu, Wind, Droplet, Siren, Terminal, Trash2, Lock } from 'lucide-react';
import { TelemetryState } from '../types';
import { warehouseService } from '../services/warehouseService';
import { useLanguage } from '../context/LanguageContext';

interface ControlTabProps {
  state: TelemetryState;
}

export const ControlTab: React.FC<ControlTabProps> = ({ state }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Target IP Banner */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            ESP32-S3 IP: <span className="font-mono font-extrabold text-slate-900 dark:text-white">{state.espIpAddress}:{state.mqttPort}</span>
            <span className="mx-2 text-slate-400">|</span>
            Arduino Nano V3: <span className="font-mono font-extrabold text-slate-900 dark:text-white">{state.nanoStatus}</span>
          </p>
        </div>

        {/* Lock Banner for Web Users */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>Fitur Kontrol Eksklusif Aplikasi Mobile (App Only)</span>
        </div>
      </div>

      {/* Grid Controls (Disabled / Greyed Out on Web) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60 pointer-events-none select-none">
        {/* Exhaust Fan */}
        <div className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between border-slate-300 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-inner">
                <Wind className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-extrabold text-slate-500">
                APP ONLY
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('exhaust_fan')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('exhaust_desc')}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">{t('actuator_status')}</span>
            <span className={`font-bold ${state.exhaustFan ? 'text-cyan-500' : 'text-slate-400'}`}>
              {state.exhaustFan ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Water Sprinkler */}
        <div className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between border-slate-300 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-extrabold text-slate-500">
                APP ONLY
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('sprinkler')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('sprinkler_desc')}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">{t('actuator_status')}</span>
            <span className={`font-bold ${state.sprinkler ? 'text-blue-500' : 'text-slate-400'}`}>
              {state.sprinkler ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Siren Alarm */}
        <div className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between border-slate-300 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                <Siren className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-extrabold text-slate-500">
                APP ONLY
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('siren')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('siren_desc')}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">{t('alarm_status')}</span>
            <span className={`font-bold ${state.sirenAlarm ? 'text-red-500' : 'text-slate-400'}`}>
              {state.sirenAlarm ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* MQTT Terminal Console (Fully Viewable on Web) */}
      <div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t('terminal_log')}
            </h3>
          </div>
          <button
            onClick={() => warehouseService.clearMqttLogs()}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('btn_clear')}
          </button>
        </div>

        <div className="h-52 w-full p-4 rounded-xl bg-slate-950/90 text-slate-200 font-mono text-xs overflow-y-auto space-y-1.5 backdrop-blur-xl border border-white/10 shadow-inner scrollbar-thin">
          {state.mqttLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
              {t('no_logs')}
            </div>
          ) : (
            state.mqttLogs.map((log, idx) => {
              let textClass = 'text-slate-300';
              if (log.includes('CONNECTED') || log.includes('RESET')) textClass = 'text-emerald-400 font-semibold';
              else if (log.includes('EMERGENCY') || log.includes('Bahaya')) textClass = 'text-red-400 font-bold';
              else if (log.includes('PUBLISH') || log.includes('CONFIG')) textClass = 'text-sky-400';

              return (
                <div key={idx} className={textClass}>
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
