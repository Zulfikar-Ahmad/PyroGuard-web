export type SystemStatus = 'Aman' | 'Peringatan' | 'Bahaya';

export interface LogRecord {
  id: string;
  timeFormatted: string;
  temperature: number;
  humidity: number;
  smoke: number;
  flameDetected: boolean;
  status: SystemStatus;
}

export interface TelemetryState {
  temperature: number;
  humidity: number;
  smoke: number;
  flameDetected: boolean;
  systemStatus: SystemStatus;
  tempThreshold: number;
  smokeThreshold: number;
  wifiSsid: string;
  wifiPass: string;
  espIpAddress: string;
  mqttPort: number;
  nanoStatus: string;
  exhaustFan: boolean;
  sprinkler: boolean;
  sirenAlarm: boolean;
  isEmergencyMode: boolean;
  isPaused: boolean;
  tempHistory: number[];
  humHistory: number[];
  timeHistory: string[];
  logRecords: LogRecord[];
  mqttLogs: string[];
}

export type ThemeMode = 'system' | 'light' | 'dark';
