import React, { createContext, useContext, useState } from 'react';

export type LanguageCode = 'System' | 'English' | 'Indonesian' | 'Japanese';

interface Translations {
  [key: string]: {
    id: string;
    en: string;
    ja: string;
  };
}

const translations: Translations = {
  // Navigation
  nav_dashboard: { id: 'Dashboard', en: 'Dashboard', ja: 'ダッシュボード' },
  nav_control: { id: 'Kontrol', en: 'Control', ja: '制御' },
  nav_history: { id: 'Histori', en: 'History', ja: '履歴' },
  nav_settings: { id: 'Pengaturan', en: 'Settings', ja: '設定' },
  nav_logout: { id: 'Keluar', en: 'Logout', ja: 'ログアウト' },

  // Settings
  settings: { id: 'Pengaturan', en: 'Settings', ja: '設定' },
  settings_title: { id: 'Pengaturan Aplikasi', en: 'App Settings', ja: 'アプリ設定' },
  settings_sub: { id: 'Pilih kategori pengaturan untuk dikonfigurasi', en: 'Select a category to configure', ja: '設定するカテゴリを選択してください' },

  appearance: { id: 'Tampilan & Tema', en: 'Appearance', ja: '外観とテーマ' },
  appearance_sub: { id: 'Mode tema, Material You, dan skema warna', en: 'Theme mode, Material You, and color palette', ja: 'テーマモード、Material You、カラーパレット' },

  system_settings: { id: 'Pengaturan Sistem', en: 'System Settings', ja: 'システム設定' },
  system_sub: { id: 'Ambang batas sensor, jadwal auto-save, MQTT, MariaDB', en: 'Sensor thresholds, auto-save schedule, MQTT, MariaDB', ja: 'センサー閾値、自動保存スケジュール、MQTT、MariaDB' },

  language: { id: 'Bahasa', en: 'Language', ja: '言語設定' },
  language_sub: { id: 'Pilihan bahasa tampilan aplikasi', en: 'Select app interface language', ja: 'アプリの表示言語を選択' },

  about: { id: 'Tentang PyroGuard', en: 'About PyroGuard', ja: 'PyroGuardについて' },
  about_sub: { id: 'Informasi versi & penjelasan sistem PyroGuard', en: 'Version information & system overview', ja: 'バージョン情報とシステム概要' },
  about_desc: {
    id: 'PyroGuard adalah sistem pemantauan gudang berbasis IoT (ESP32-S3 + Arduino Nano V3) dengan protokol komunikasi MQTT real-time dan penyimpanan data histori MariaDB.',
    en: 'PyroGuard is an IoT-based warehouse monitoring system (ESP32-S3 + Arduino Nano V3) with real-time MQTT communication protocol and MariaDB history data storage.',
    ja: 'PyroGuardは、リアルタイムMQTT通信プロトコルとMariaDB履歴データストレージを備えたIoTベース（ESP32-S3 + Arduino Nano V3）の倉庫監視システムです。',
  },

  logout: { id: 'Keluar dari Akun', en: 'Log Out', ja: 'ログアウト' },
  select_language: { id: 'Pilih Bahasa Aplikasi', en: 'Select App Language', ja: 'アプリ言語を選択' },
  back_to_settings: { id: 'Kembali ke Daftar Pengaturan', en: 'Back to Settings List', ja: '設定一覧に戻る' },

  // Status Banner
  status_offline_title: { id: 'STATUS GUDANG: SYSTEM OFFLINE', en: 'WAREHOUSE STATUS: SYSTEM OFFLINE', ja: '倉庫ステータス：システムオフライン' },
  status_offline_desc: { id: 'Tidak ada data stream MQTT dari ESP32. Statistik dikembalikan ke 0.', en: 'No MQTT data stream from ESP32. Statistics reset to 0.', ja: 'ESP32からのMQTTデータなし。統計は0にリセットされます。' },
  status_safe_title: { id: 'STATUS GUDANG: SISTEM AMAN', en: 'WAREHOUSE STATUS: SYSTEM SAFE', ja: '倉庫ステータス：システム正常' },
  status_safe_desc: { id: 'Suhu, kelembapan, kadar asap, dan pendeteksi api berada dalam parameter normal.', en: 'Temperature, humidity, smoke level, and flame detector are within normal parameters.', ja: '温度、湿度、煙濃度、火災検知器は正常範囲内です。' },
  status_danger_title: { id: 'STATUS GUDANG: BAHAYA KEBAKARAN!', en: 'WAREHOUSE STATUS: FIRE DANGER!', ja: '倉庫ステータス：火災の危険！' },
  status_warning_title: { id: 'STATUS GUDANG: PERINGATAN WASPADA', en: 'WAREHOUSE STATUS: WARNING', ja: '倉庫ステータス：警告' },

  // Sensors
  sensor_temp: { id: 'Suhu Ruangan', en: 'Room Temperature', ja: '室温' },
  sensor_hum: { id: 'Kelembapan Udara', en: 'Air Humidity', ja: '湿度' },
  sensor_smoke: { id: 'Kadar Asap', en: 'Smoke Level', ja: '煙濃度' },
  sensor_flame: { id: 'Detektor Api', en: 'Flame Detector', ja: '火災検知器' },
  flame_detected: { id: 'API ADA!', en: 'FIRE DETECTED!', ja: '火災検知！' },
  no_flame: { id: 'TIDAK ADA', en: 'NO FIRE', ja: '火災なし' },

  ideal_hum: { id: 'Ideal: 40% - 70%', en: 'Ideal: 40% - 70%', ja: '理想範囲: 40% - 70%' },
  infra_sensor: { id: 'Sensor Inframerah', en: 'Infrared Sensor', ja: '赤外線センサー' },

  status_normal: { id: 'Normal', en: 'Normal', ja: '正常' },
  status_high: { id: 'Tinggi', en: 'High', ja: '高温' },
  status_humid: { id: 'Lembap', en: 'Humid', ja: '多湿' },
  status_dry: { id: 'Kering', en: 'Dry', ja: '乾燥' },
  status_optimum: { id: 'Optimum', en: 'Optimum', ja: '最適' },
  status_clean: { id: 'Bersih', en: 'Clean', ja: 'クリーン' },
  status_standby: { id: 'Standby', en: 'Standby', ja: '待機中' },
  status_active: { id: 'Aktif', en: 'Active', ja: 'アクティブ' },
  status_alert: { id: 'WASPADA', en: 'ALERT', ja: '警戒' },

  // Chart
  chart_title: { id: 'Grafik Real-Time Telemetri Gudang', en: 'Real-Time Warehouse Telemetry Chart', ja: 'リアルタイム倉庫テレメトリグラフ' },
  chart_desc: { id: 'Fluktuasi Suhu (°C) & Kelembapan (%) dari Waktu ke Waktu', en: 'Temperature (°C) & Humidity (%) Fluctuations Over Time', ja: '時間の経過に伴う温度（°C）と湿度（%）の変動' },

  // Control Tab
  control_title: { id: 'Kontrol Perangkat Aktuator', en: 'Actuator Controls', ja: 'アクチュエータ制御' },
  exhaust_fan: { id: 'Exhaust Fan Gudang', en: 'Warehouse Exhaust Fan', ja: '倉庫換気扇' },
  exhaust_desc: { id: 'Sirkulasi udara & penyerap hawa panas/asap.', en: 'Air circulation & smoke extractor.', ja: '空気循環および煙排気装置。' },
  sprinkler: { id: 'Water Sprinkler', en: 'Water Sprinkler', ja: 'スプリンクラー' },
  sprinkler_desc: { id: 'Sistem pemadam air otomatis bertekanan.', en: 'Automatic pressurized water extinguisher.', ja: '自動加圧水消火装置。' },
  siren: { id: 'Sirine & Alarm Kebakaran', en: 'Siren & Fire Alarm', ja: 'サイレン＆火災警報' },
  siren_desc: { id: 'Peringatan suara darurat gedung gudang.', en: 'Emergency sound warning for warehouse.', ja: '倉庫緊急音声警報。' },
  actuator_status: { id: 'Status Aktuator:', en: 'Actuator Status:', ja: 'アクチュエータ状態:' },
  alarm_status: { id: 'Status Alarm:', en: 'Alarm Status:', ja: '警報状態:' },
  no_logs: { id: 'Tidak ada log aktivitas.', en: 'No activity logs.', ja: 'アクティビティログはありません。' },
  stop_siren: { id: 'STOP SIREN', en: 'STOP SIREN', ja: 'サイレン停止' },
  trigger_siren: { id: 'TRIGGER SIREN', en: 'TRIGGER SIREN', ja: 'サイレン起動' },
  reset_emergency: { id: 'RESET DARURAT', en: 'RESET EMERGENCY', ja: '緊急リセット' },
  test_alarm: { id: 'Tes Alarm Kebakaran', en: 'Test Fire Alarm', ja: '火災警報テスト' },
  terminal_log: { id: 'Konsol Perintah & Log Publikasi MQTT', en: 'MQTT Command & Publication Log Console', ja: 'MQTTコマンド＆ログコンソール' },

  // History Tab
  history_title: { id: 'Histori Data Sensor & Kejadian', en: 'Sensor & Event Data History', ja: 'センサー・イベント履歴' },
  history_desc: { id: 'Terjadwal Otomatis & Simpan Manual', en: 'Auto Scheduled & Manual Save', ja: '自動スケジュール＆手動保存' },
  btn_save_manual: { id: 'Simpan History Manual', en: 'Save Manual History', ja: '手動履歴保存' },
  btn_clear: { id: 'Bersihkan', en: 'Clear', ja: '消去' },
  btn_export_csv: { id: 'Export CSV', en: 'Export CSV', ja: 'CSV出力' },
  no_history: { id: 'Belum ada data histori.', en: 'No history records found.', ja: '履歴データはありません。' },
  col_time: { id: 'Waktu Log', en: 'Log Time', ja: '記録時間' },
  col_temp: { id: 'Suhu (°C)', en: 'Temp (°C)', ja: '温度 (°C)' },
  col_hum: { id: 'Kelembapan (%)', en: 'Humidity (%)', ja: '湿度 (%)' },
  col_smoke: { id: 'Kadar Asap (%)', en: 'Smoke (%)', ja: '煙濃度 (%)' },
  col_flame: { id: 'Detektor Api', en: 'Flame Detector', ja: '火災検知' },
  col_status: { id: 'Status Sistem', en: 'System Status', ja: 'システム状態' },

  // Forms & Settings
  max_temp_label: { id: 'Batas Maksimum Suhu (°C)', en: 'Maximum Temperature Threshold (°C)', ja: '最高温度閾値 (°C)' },
  max_smoke_label: { id: 'Batas Maksimum Kadar Asap (%)', en: 'Maximum Smoke Level Threshold (%)', ja: '最高煙濃度閾値 (%)' },
  auto_save_time_label: { id: 'Jam Terjadwal Auto-Save (HH:mm)', en: 'Scheduled Auto-Save Time (HH:mm)', ja: '自動保存予約時刻 (HH:mm)' },
  auto_save_schedule_title: { id: 'Jadwal Auto-Save History Perhari', en: 'Daily History Auto-Save Schedule', ja: '日次履歴自動保存スケジュール' },
  threshold_title: { id: 'Konfigurasi Ambang Batas Sensor (Threshold)', en: 'Sensor Threshold Configuration', ja: 'センサー閾値設定' },
  threshold_desc: { id: 'Atur batas maksimal sensor penentu alarm otomatis & aktuator.', en: 'Set maximum sensor limits for automated alarms & actuators.', ja: '自動警報およびアクチュエータの最高センサー限界を設定します。' },
  select_lang_label: { id: 'Pilih Bahasa / Select Language:', en: 'Select Language:', ja: '言語を選択:' },
  save_config: { id: 'Simpan Konfigurasi', en: 'Save Settings', ja: '設定を保存' },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('pyroguard_language') as LanguageCode) || 'System';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('pyroguard_language', lang);
  };

  const getEffectiveLangKey = (): 'id' | 'en' | 'ja' => {
    if (language === 'English') return 'en';
    if (language === 'Japanese') return 'ja';
    if (language === 'Indonesian') return 'id';
    // Default System
    const sysLang = navigator.language.toLowerCase();
    if (sysLang.startsWith('ja')) return 'ja';
    if (sysLang.startsWith('en')) return 'en';
    return 'id';
  };

  const t = (key: string): string => {
    const langKey = getEffectiveLangKey();
    if (translations[key] && translations[key][langKey]) {
      return translations[key][langKey];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
