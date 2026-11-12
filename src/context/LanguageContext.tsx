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

  // Status Banner
  status_offline_title: { id: 'STATUS GUDANG: SYSTEM OFFLINE', en: 'WAREHOUSE STATUS: SYSTEM OFFLINE', ja: '倉庫ステータス：システムオフライン' },
  status_offline_desc: { id: 'Tidak ada data stream MQTT dari ESP32. Statistik dikembalikan ke 0.', en: 'No MQTT stream from ESP32. Statistics reset to 0.', ja: 'ESP32からのMQTTストリームがありません。統計は0にリセットされます。' },
  status_safe_title: { id: 'STATUS GUDANG: SISTEM AMAN', en: 'WAREHOUSE STATUS: SYSTEM SAFE', ja: '倉庫ステータス：システム正常' },
  status_safe_desc: { id: 'Suhu, kelembapan, kadar asap, dan pendeteksi api berada dalam parameter normal.', en: 'Temperature, humidity, smoke level, and flame detector are within normal parameters.', ja: '温度、湿度、煙濃度、火災検知器はすべて正常範囲内です。' },
  status_danger_title: { id: 'STATUS GUDANG: BAHAYA KEBAKARAN!', en: 'WAREHOUSE STATUS: FIRE DANGER!', ja: '倉庫ステータス：火災の危険！' },
  status_warning_title: { id: 'STATUS GUDANG: PERINGATAN WASPADA', en: 'WAREHOUSE STATUS: WARNING', ja: '倉庫ステータス：警告' },

  // Sensor Cards
  sensor_temp: { id: 'Suhu Ruangan', en: 'Room Temperature', ja: '室温' },
  sensor_hum: { id: 'Kelembapan Udara', en: 'Air Humidity', ja: '湿度' },
  sensor_smoke: { id: 'Kadar Asap', en: 'Smoke Level', ja: '煙濃度' },
  sensor_flame: { id: 'Detektor Api', en: 'Flame Detector', ja: '火災検知器' },
  status_flame_yes: { id: 'API ADA!', en: 'FIRE DETECTED!', ja: '火災検知！' },
  status_flame_no: { id: 'TIDAK ADA', en: 'NO FIRE', ja: '火災なし' },

  // History Tab
  history_title: { id: 'Histori Data Sensor & Kejadian', en: 'Sensor & Event Data History', ja: 'センサー・イベント履歴' },
  history_desc: { id: 'Terjadwal Otomatis & Simpan Manual', en: 'Auto Scheduled & Manual Save', ja: '自動スケジュール＆手動保存' },
  btn_save_manual: { id: 'Simpan History Manual', en: 'Save Manual History', ja: '手動履歴保存' },
  btn_clear: { id: 'Bersihkan', en: 'Clear', ja: '消去' },
  btn_export_csv: { id: 'Export CSV', en: 'Export CSV', ja: 'CSV出力' },
  no_history: { id: 'Belum ada data histori.', en: 'No history records found.', ja: '履歴データはありません。' },

  // Control Tab
  control_title: { id: 'Kontrol Perangkat Aktuator', en: 'Actuator Device Controls', ja: 'アクチュエータ制御' },
  exhaust_fan: { id: 'Exhaust Fan Gudang', en: 'Warehouse Exhaust Fan', ja: '倉庫換気扇' },
  sprinkler: { id: 'Water Sprinkler', en: 'Water Sprinkler', ja: 'スプリンクラー' },
  siren_alarm: { id: 'Sirine & Alarm Kebakaran', en: 'Siren & Fire Alarm', ja: 'サイレン＆火災警報' },

  // Settings
  theme_mode: { id: 'Mode Tema', en: 'Theme Mode', ja: 'テーマモード' },
  theme_system: { id: 'Sistem', en: 'System', ja: 'システム' },
  theme_light: { id: 'Terang', en: 'Light', ja: 'ライト' },
  theme_dark: { id: 'Gelap', en: 'Dark', ja: 'ダーク' },
  language: { id: 'Bahasa', en: 'Language', ja: '言語' },
  save_config: { id: 'Simpan Konfigurasi', en: 'Save Configuration', ja: '設定を保存' },
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
