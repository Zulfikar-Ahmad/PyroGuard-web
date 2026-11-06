import React from 'react';
import { Cpu, Wind, Droplet, Siren, Flame, RotateCcw, Terminal, Trash2 } from 'lucide-react';
import { TelemetryState } from '../types';
import { warehouseService } from '../services/warehouseService';

interface ControlTabProps {
  state: TelemetryState;
}

export const ControlTab: React.FC<ControlTabProps> = ({ state }) => {
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
        {state.isEmergencyMode ? (
          <button
            onClick={() => warehouseService.resetEmergency()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            RESET DARURAT
          </button>
        ) : (
          <button
            onClick={() => warehouseService.triggerEmergencySimulation()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition active:scale-95"
          >
            <Flame className="w-4 h-4" />
            Tes Alarm Kebakaran
          </button>
        )}
      </div>

      {/* Grid Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exhaust Fan */}
        <div className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition duration-300">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-inner">
                <Wind className="w-6 h-6" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.exhaustFan}
                  onChange={(e) => warehouseService.setExhaust(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300/60 peer-focus:outline-none rounded-full peer dark:bg-slate-700/60 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
              </label>
            </div>
            <div className="mt-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Exhaust Fan Gudang</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sirkulasi udara & penyerap hawa panas/asap.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Status Aktuator:</span>
            <span className={`font-bold ${state.exhaustFan ? 'text-cyan-500' : 'text-slate-400'}`}>
              {state.exhaustFan ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Water Sprinkler */}
        <div className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition duration-300">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                <Droplet className="w-6 h-6" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.sprinkler}
                  onChange={(e) => warehouseService.setSprinkler(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300/60 peer-focus:outline-none rounded-full peer dark:bg-slate-700/60 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
              </label>
            </div>
            <div className="mt-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Water Sprinkler</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sistem pemadam air otomatis area gudang.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Status Aktuator:</span>
            <span className={`font-bold ${state.sprinkler ? 'text-blue-500' : 'text-slate-400'}`}>
              {state.sprinkler ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Siren Alarm */}
        <div className={`p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between transition duration-300 ${state.sirenAlarm ? 'border-red-500/60 shadow-lg shadow-red-500/10' : 'hover:border-red-500/40'}`}>
          <div>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${state.sirenAlarm ? 'bg-red-500/20 text-red-500 animate-bounce' : 'bg-red-500/10 text-red-500'}`}>
                <Siren className="w-6 h-6" />
              </div>
              <button
                onClick={() => warehouseService.setSiren(!state.sirenAlarm)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white transition shadow-md active:scale-95 ${state.sirenAlarm ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}`}
              >
                {state.sirenAlarm ? 'STOP SIREN' : 'TRIGGER SIREN'}
              </button>
            </div>
            <div className="mt-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Sirine Darurat Gudang</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Aktifkan buzzer alarm secara manual atau otomatis.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Status Alarm:</span>
            <span className={`font-bold ${state.sirenAlarm ? 'text-red-500' : 'text-slate-400'}`}>
              {state.sirenAlarm ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* MQTT Terminal Console */}
      <div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Konsol Perintah & Log Publikasi MQTT
            </h3>
          </div>
          <button
            onClick={() => warehouseService.clearMqttLogs()}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan Log
          </button>
        </div>

        <div className="h-52 w-full p-4 rounded-xl bg-slate-950/90 text-slate-200 font-mono text-xs overflow-y-auto space-y-1.5 backdrop-blur-xl border border-white/10 shadow-inner scrollbar-thin">
          {state.mqttLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
              Tidak ada log aktivitas.
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
