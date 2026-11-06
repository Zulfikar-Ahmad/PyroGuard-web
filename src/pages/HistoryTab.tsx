import React, { useState } from 'react';
import { Download, Trash2, Check } from 'lucide-react';
import { TelemetryState } from '../types';
import { warehouseService } from '../services/warehouseService';

interface HistoryTabProps {
  state: TelemetryState;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ state }) => {
  const [copied, setCopied] = useState(false);

  const handleExportCsv = () => {
    const csv = warehouseService.exportCsvData();

    // Copy to clipboard
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PyroGuard_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Histori Data Sensor & Kejadian
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catatan telemetri realtime & kejadian bahaya dari ESP32-S3
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.logRecords.length > 0 && (
            <button
              onClick={() => warehouseService.clearHistory()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bersihkan
            </button>
          )}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            {copied ? 'Berhasil Disalin & Diunduh!' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        {state.logRecords.length === 0 ? (
          <div className="p-12 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Belum ada data telemetri yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Waktu Log</th>
                  <th className="py-3.5 px-4">Suhu (°C)</th>
                  <th className="py-3.5 px-4">Kelembapan (%)</th>
                  <th className="py-3.5 px-4">Kadar Asap (%)</th>
                  <th className="py-3.5 px-4">Detektor Api</th>
                  <th className="py-3.5 px-4">Status Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-700/40 text-slate-800 dark:text-slate-200 font-medium">
                {state.logRecords.map((rec) => {
                  let statusBadgeClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                  if (rec.status === 'Bahaya') {
                    statusBadgeClass = 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20';
                  } else if (rec.status === 'Peringatan') {
                    statusBadgeClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20';
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-white/60 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono font-bold">{rec.timeFormatted}</td>
                      <td className="py-3.5 px-4 font-bold">{rec.temperature.toFixed(1)}</td>
                      <td className="py-3.5 px-4">{rec.humidity.toFixed(0)}</td>
                      <td className="py-3.5 px-4">{rec.smoke.toFixed(0)}</td>
                      <td className={`py-3.5 px-4 ${rec.flameDetected ? 'font-extrabold text-red-500 animate-pulse' : ''}`}>
                        {rec.flameDetected ? 'TERDETEKSI' : 'Aman'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadgeClass}`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
