export type SystemStatus = 'Aman' | 'Peringatan' | 'Bahaya' | 'Offline';

export interface LogRecord {
  id: string;
  timeFormatted: string;
  temperature: number;
  humidity: number;
  smoke: number;
  flameDetected: boolean;
  status: SystemStatus;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  token?: string;
}

export interface TelemetryState {
  isDeviceConnected: boolean;
  temperature: number;
  humidity: number;
  smoke: number;
  flameDetected: boolean;
  systemStatus: SystemStatus;
  tempThreshold: number;
  smokeThreshold: number;

  // MQTT Config
  mqttHost: string;
  mqttPort: number;
  mqttTopic: string;
  mqttUser: string;
  mqttPass: string;

  // MySQL / Database Config
  mysqlApiEndpoint: string;
  mysqlDbHost: string;
  mysqlDbPort: number;
  mysqlDbName: string;
  mysqlDbUser: string;
  mysqlDbPass: string;

  // Schedule Config
  scheduledSaveTime: string;

  espIpAddress: string;
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
