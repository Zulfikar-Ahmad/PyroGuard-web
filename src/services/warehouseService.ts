import mqtt, { MqttClient } from 'mqtt';
import { LogRecord, SystemStatus, TelemetryState } from '../types';

type Listener = (state: TelemetryState) => void;

class WarehouseService {
  private static instance: WarehouseService;
  private listeners: Set<Listener> = new Set();
  private client: MqttClient | null = null;
  private connectionTimer: number | null = null;
  private scheduleCheckTimer: number | null = null;
  private lastSavedDate: string = '';

  /*
   * ============================================================================
   * CONFIGURATION KEYS FOR MQTT BROKER & MYSQL DATABASE / REST API
   * ============================================================================
   * 1. MQTT Broker Details (Cloudflare Tunnel to Docker VM):
   *    - Domain/Host: mqttHost (default: "mqtt.pyroguard.app")
   *    - Port: mqttPort (default: 443 WSS)
   *    - Username: mqttUser (default: "pyroadmin")
   *    - Password: mqttPass (default: "pyroguard371")
   *    - Topic: mqttTopic (default: "warehouse/sensors/telemetry")
   *
   * 2. MySQL / Backend API Details:
   *    - API Endpoint: mysqlApiEndpoint (default: "https://api.pyroguard.app/history")
   *    - Database Host: mysqlDbHost (default: "127.0.0.1")
   *    - Database Name: mysqlDbName (default: "warehouse_iot")
   *    - Database User: mysqlDbUser (default: "pyroadmin")
   *    - Database Pass: mysqlDbPass (default: "pyroguard371")
   * ============================================================================
   */

  private state: TelemetryState = {
    isDeviceConnected: false,
    temperature: 0,
    humidity: 0,
    smoke: 0,
    flameDetected: false,
    systemStatus: 'Offline',
    tempThreshold: 45.0,
    smokeThreshold: 30.0,

    // MQTT Configuration (Cloudflare Tunnel WSS to Docker VM)
    mqttHost: 'mqtt.pyroguard.app',
    mqttPort: 443,
    mqttTopic: 'warehouse/sensors/telemetry',
    mqttUser: 'pyroadmin',
    mqttPass: 'pyroguard371',

    // MySQL / REST API Configuration
    mysqlApiEndpoint: 'https://api.pyroguard.app/history',
    mysqlDbHost: '127.0.0.1',
    mysqlDbPort: 3306,
    mysqlDbName: 'warehouse_iot',
    mysqlDbUser: 'pyroadmin',
    mysqlDbPass: 'pyroguard371',

    // History Schedule Config (Default: 03:00 AM)
    scheduledSaveTime: '03:00',

    espIpAddress: 'mqtt.pyroguard.app',
    nanoStatus: 'Standby (Awaiting ESP32)',
    exhaustFan: false,
    sprinkler: false,
    sirenAlarm: false,
    isEmergencyMode: false,
    isPaused: false,

    tempHistory: [0, 0, 0, 0, 0, 0, 0, 0],
    humHistory: [0, 0, 0, 0, 0, 0, 0, 0],
    timeHistory: ['--:--:--', '--:--:--', '--:--:--', '--:--:--', '--:--:--', '--:--:--', '--:--:--', '--:--:--'],
    logRecords: [],
    mqttLogs: [
      `[${this.formatTime(new Date())}] [SYSTEM] Memulai sistem monitoring MQTT & MariaDB Database...`,
      `[${this.formatTime(new Date())}] [INFO] Menghubungkan ke Broker Cloudflare Tunnel wss://mqtt.pyroguard.app:443 (User: pyroadmin)...`,
    ],
  };

  private constructor() {
    this.startScheduleChecker();
    this.initMqttConnection();
    this.fetchHistoryFromApi();
  }

  public static getInstance(): WarehouseService {
    if (!WarehouseService.instance) {
      WarehouseService.instance = new WarehouseService();
    }
    return WarehouseService.instance;
  }

  public getState(): TelemetryState {
    return { ...this.state };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  private formatTime(date: Date = new Date()): string {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  private formatDateKey(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /*
   * Format standard SQL DATETIME string: YYYY-MM-DD HH:mm:ss for MariaDB
   */
  private formatSqlTimestamp(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  /*
   * Connect Real MQTT WebSocket Client to wss://mqtt.pyroguard.app:443
   */
  private initMqttConnection() {
    const protocol = this.state.mqttPort === 443 ? 'wss' : 'ws';
    const brokerUrl = `${protocol}://${this.state.mqttHost}:${this.state.mqttPort}`;
    const timeStr = this.formatTime();

    try {
      if (this.client) {
        this.client.end(true);
      }

      this.client = mqtt.connect(brokerUrl, {
        username: this.state.mqttUser,
        password: this.state.mqttPass,
        keepalive: 60,
        clientId: 'PyroGuardWeb_' + Math.random().toString(16).substring(2, 8),
        clean: true,
        reconnectPeriod: 4000,
        connectTimeout: 10000,
      });

      this.client.on('connect', () => {
        const connectLog = `[${this.formatTime()}] [MQTT CONNECTED] Berhasil terhubung ke ${brokerUrl}`;
        this.state.mqttLogs = [...this.state.mqttLogs, connectLog];
        this.client?.subscribe(this.state.mqttTopic);
        this.notify();
      });

      this.client.on('message', (_topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          this.onMqttMessageReceived({
            temperature: Number(payload.temperature ?? payload.temp ?? 0),
            humidity: Number(payload.humidity ?? payload.hum ?? 0),
            smoke: Number(payload.smoke ?? payload.smk ?? 0),
            flameDetected: Boolean(payload.flameDetected ?? payload.flame ?? false),
          });
        } catch (err) {
          console.warn('Failed to parse MQTT JSON payload:', err);
        }
      });

      this.client.on('error', (err) => {
        console.warn('MQTT WebSocket Error:', err.message);
      });
    } catch (e) {
      const errLog = `[${timeStr}] [MQTT EXCEPTION] ${e}`;
      this.state.mqttLogs = [...this.state.mqttLogs, errLog];
      this.notify();
    }

    if (this.connectionTimer) clearInterval(this.connectionTimer);
    this.connectionTimer = window.setInterval(() => {
      this.checkConnectionTimeout();
    }, 5000);
  }

  /*
   * Handle incoming real-time telemetry stream from ESP32 via MQTT
   */
  public onMqttMessageReceived(data: { temperature: number; humidity: number; smoke: number; flameDetected: boolean }) {
    const now = new Date();
    const timeStr = this.formatTime(now);

    let status: SystemStatus = 'Aman';
    if (data.flameDetected || this.state.isEmergencyMode) {
      status = 'Bahaya';
    } else if (data.temperature >= this.state.tempThreshold || data.smoke >= this.state.smokeThreshold) {
      status = 'Peringatan';
    }

    const newTempHistory = [...this.state.tempHistory.slice(-14), Number(data.temperature.toFixed(1))];
    const newHumHistory = [...this.state.humHistory.slice(-14), Number(data.humidity.toFixed(0))];
    const newTimeHistory = [...this.state.timeHistory.slice(-14), timeStr];

    const newMqttLogs = [...this.state.mqttLogs];
    newMqttLogs.push(
      `[${timeStr}] [STREAM] Temp:${data.temperature.toFixed(1)}°C Hum:${data.humidity.toFixed(0)}% Smoke:${data.smoke.toFixed(0)}% Flame:${data.flameDetected ? 'YES' : 'NO'}`
    );
    if (newMqttLogs.length > 50) newMqttLogs.shift();

    this.state = {
      ...this.state,
      isDeviceConnected: true,
      temperature: data.temperature,
      humidity: data.humidity,
      smoke: data.smoke,
      flameDetected: data.flameDetected,
      systemStatus: status,
      nanoStatus: 'Active (UART Sync OK)',
      tempHistory: newTempHistory,
      humHistory: newHumHistory,
      timeHistory: newTimeHistory,
      mqttLogs: newMqttLogs,
    };

    this.notify();
  }

  /*
   * If ESP32 is turned off or disconnected, reset metrics to 0 and set status to Offline
   */
  private checkConnectionTimeout() {
    if (!this.state.isDeviceConnected) {
      if (this.state.systemStatus !== 'Offline') {
        const timeStr = this.formatTime();
        const logs = [
          ...this.state.mqttLogs,
          `[${timeStr}] [OFFLINE] ⚠️ Perangkat ESP32 terputus / mati! Mengembalikan statistik dashboard ke nol.`,
        ];

        this.state = {
          ...this.state,
          isDeviceConnected: false,
          temperature: 0,
          humidity: 0,
          smoke: 0,
          flameDetected: false,
          systemStatus: 'Offline',
          nanoStatus: 'Disconnected (No Stream)',
          exhaustFan: false,
          sprinkler: false,
          sirenAlarm: false,
          mqttLogs: logs,
        };
        this.notify();
      }
    }
  }

  /*
   * Simulates an incoming test MQTT packet from ESP32 (for testing real stream)
   */
  public simulateIncomingEspStream(temp: number, hum: number, smoke: number, flame: boolean) {
    this.onMqttMessageReceived({ temperature: temp, humidity: hum, smoke, flameDetected: flame });
  }

  /*
   * Schedule Checker: Runs every minute to auto-save history at specified time (Default: 03:00 AM)
   */
  private startScheduleChecker() {
    if (this.scheduleCheckTimer) clearInterval(this.scheduleCheckTimer);
    this.scheduleCheckTimer = window.setInterval(() => {
      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayKey = this.formatDateKey(now);

      if (currentHHMM === this.state.scheduledSaveTime && this.lastSavedDate !== todayKey) {
        this.lastSavedDate = todayKey;
        this.saveScheduledHistory();
      }
    }, 20000);
  }

  /*
   * Save History Record on Schedule (e.g. 03:00 AM)
   */
  private saveScheduledHistory() {
    const timeStr = this.formatTime();
    const record: LogRecord = {
      id: Date.now().toString(),
      timeFormatted: `${timeStr} WIB (Auto-Schedule)`,
      temperature: this.state.temperature,
      humidity: this.state.humidity,
      smoke: this.state.smoke,
      flameDetected: this.state.flameDetected,
      status: this.state.systemStatus,
    };

    this.addLogRecordAndSyncDb(record, `[SCHEDULED AUTO-SAVE ${this.state.scheduledSaveTime}]`);
  }

  /*
   * Save History Record Manually on User Command
   */
  public saveManualHistory() {
    const timeStr = this.formatTime();
    const record: LogRecord = {
      id: Date.now().toString(),
      timeFormatted: `${timeStr} WIB (Manual Save)`,
      temperature: this.state.temperature,
      humidity: this.state.humidity,
      smoke: this.state.smoke,
      flameDetected: this.state.flameDetected,
      status: this.state.systemStatus,
    };

    this.addLogRecordAndSyncDb(record, '[MANUAL SAVE]');
  }

  /*
   * Add Record to Local State and Post to MySQL Database / REST API
   */
  private addLogRecordAndSyncDb(record: LogRecord, sourceLabel: string) {
    const timeStr = this.formatTime();
    const newRecords = [record, ...this.state.logRecords.slice(0, 99)];
    const logs = [
      ...this.state.mqttLogs,
      `[${timeStr}] ${sourceLabel} Menyimpan rekaman histori (Temp:${record.temperature}°C, Status:${record.status}) ke Database MySQL/MariaDB (${this.state.mysqlDbName})...`,
    ];

    this.state = {
      ...this.state,
      logRecords: newRecords,
      mqttLogs: logs,
    };
    this.notify();

    // Async call to MySQL / REST API backend
    this.syncRecordToMysqlDatabase(record);
  }

  /*
   * Fetch History from MySQL Database REST API on startup (Tries /api/history and /history candidates)
   */
  public async fetchHistoryFromApi() {
    const cleanBase = this.state.mysqlApiEndpoint.replace(/\/api\/history|\/history|\/$/, '');
    const endpoints = [
      `${cleanBase}/api/history`,
      `${cleanBase}/history`,
      this.state.mysqlApiEndpoint,
    ];
    const uniqueEndpoints = Array.from(new Set(endpoints));

    for (const url of uniqueEndpoints) {
      try {
        if (url && url.startsWith('http')) {
          const res = await fetch(url, { method: 'GET', mode: 'cors' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const fetchedRecords: LogRecord[] = data.map((item: {
                id?: string | number;
                timestamp?: string;
                timeFormatted?: string;
                temperature: number;
                humidity: number;
                smoke: number;
                flame_detected?: boolean | number;
                flameDetected?: boolean;
                status: SystemStatus;
              }) => ({
                id: String(item.id || Math.random()),
                timeFormatted: item.timeFormatted || item.timestamp || this.formatTime(),
                temperature: Number(item.temperature),
                humidity: Number(item.humidity),
                smoke: Number(item.smoke),
                flameDetected: Boolean(item.flame_detected ?? item.flameDetected ?? false),
                status: item.status || 'Aman',
              }));

              this.state.logRecords = fetchedRecords;
              const logMsg = `[${this.formatTime()}] [MYSQL GET OK] Berhasil memuat ${fetchedRecords.length} data histori dari database MariaDB (${url}).`;
              this.state.mqttLogs = [...this.state.mqttLogs, logMsg];
              this.notify();
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch history records from URL:', url, e);
      }
    }
  }

  /*
   * Backend Sync Function: Send LogRecord to MySQL Database via REST API (Tries /api/history and /history candidates)
   */
  private async syncRecordToMysqlDatabase(record: LogRecord) {
    const timeStr = this.formatTime();
    const cleanBase = this.state.mysqlApiEndpoint.replace(/\/api\/history|\/history|\/$/, '');
    const endpoints = [
      `${cleanBase}/api/history`,
      `${cleanBase}/history`,
      this.state.mysqlApiEndpoint,
    ];
    const uniqueEndpoints = Array.from(new Set(endpoints));
    const sqlTimestamp = this.formatSqlTimestamp(new Date());

    let lastError = '';

    for (const url of uniqueEndpoints) {
      try {
        if (url && url.startsWith('http')) {
          const res = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: sqlTimestamp,
              temperature: record.temperature,
              humidity: record.humidity,
              smoke: record.smoke,
              flame_detected: record.flameDetected,
              status: record.status,
              db_host: this.state.mysqlDbHost,
              db_name: this.state.mysqlDbName,
              db_user: this.state.mysqlDbUser,
              db_pass: this.state.mysqlDbPass,
            }),
          });

          if (res.ok) {
            const okLog = `[${timeStr}] [MYSQL OK] Data histori berhasil tersimpan ke MariaDB via ${url}!`;
            this.state.mqttLogs = [...this.state.mqttLogs, okLog];
            this.fetchHistoryFromApi(); // Refresh list from DB
            return;
          } else if (res.status === 404) {
            lastError = `HTTP 404 Not Found at ${url}`;
            continue; // Try next candidate URL
          } else {
            const errText = await res.text();
            lastError = `HTTP ${res.status}: ${errText}`;
          }
        }
      } catch (err) {
        lastError = `Connection Error: ${err}`;
      }
    }

    const errLog = `[${timeStr}] [MYSQL SYNC FAILED] Gagal mengirim ke API Endpoint. Detail: ${lastError}`;
    this.state.mqttLogs = [...this.state.mqttLogs, errLog];
    this.notify();
  }

  // Actuator Actions
  public setExhaust(value: boolean) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [PUBLISH] warehouse/actuator/fan -> ${value ? 'ON' : 'OFF'}`,
    ];
    if (this.client && this.client.connected) {
      this.client.publish('warehouse/actuator/fan', value ? 'ON' : 'OFF');
    }
    this.state = { ...this.state, exhaustFan: value, mqttLogs: newLogs };
    this.notify();
  }

  public setSprinkler(value: boolean) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [PUBLISH] warehouse/actuator/sprinkler -> ${value ? 'ON' : 'OFF'}`,
    ];
    if (this.client && this.client.connected) {
      this.client.publish('warehouse/actuator/sprinkler', value ? 'ON' : 'OFF');
    }
    this.state = { ...this.state, sprinkler: value, mqttLogs: newLogs };
    this.notify();
  }

  public setSiren(value: boolean) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [PUBLISH] warehouse/actuator/siren -> ${value ? 'ACTIVE' : 'STANDBY'}`,
    ];
    if (this.client && this.client.connected) {
      this.client.publish('warehouse/actuator/siren', value ? 'ACTIVE' : 'STANDBY');
    }
    this.state = { ...this.state, sirenAlarm: value, mqttLogs: newLogs };
    this.notify();
  }

  public triggerEmergencySimulation() {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [EMERGENCY] 🔥 ALARM KEBAKARAN DITRIGGER!`,
      `[${timeStr}] [PUBLISH] warehouse/emergency -> SIRINE & SPRINKLER DIAKTIFKAN`,
    ];
    if (this.client && this.client.connected) {
      this.client.publish('warehouse/emergency', 'TRIGGERED');
    }
    this.state = {
      ...this.state,
      isEmergencyMode: true,
      flameDetected: true,
      sirenAlarm: true,
      exhaustFan: true,
      sprinkler: true,
      systemStatus: 'Bahaya',
      mqttLogs: newLogs,
    };
    this.notify();
  }

  public resetEmergency() {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [RESET] Status darurat berhasil direset ke mode Normal.`,
    ];
    if (this.client && this.client.connected) {
      this.client.publish('warehouse/emergency', 'RESET');
    }
    this.state = {
      ...this.state,
      isEmergencyMode: false,
      flameDetected: false,
      sirenAlarm: false,
      exhaustFan: false,
      sprinkler: false,
      systemStatus: this.state.isDeviceConnected ? 'Aman' : 'Offline',
      mqttLogs: newLogs,
    };
    this.notify();
  }

  public clearMqttLogs() {
    this.state = { ...this.state, mqttLogs: [] };
    this.notify();
  }

  public clearHistory() {
    this.state = { ...this.state, logRecords: [] };
    this.notify();
  }

  public exportCsvData(): string {
    let csv = 'Waktu,Suhu (C),Kelembapan (%),Asap (%),Flame,Status\n';
    this.state.logRecords.forEach((rec) => {
      csv += `${rec.timeFormatted},${rec.temperature},${rec.humidity},${rec.smoke},${rec.flameDetected ? 'YA' : 'TIDAK'},${rec.status}\n`;
    });
    return csv;
  }

  /*
   * Save updated Configuration Settings (MQTT, MySQL, Schedule, Thresholds)
   */
  public updateSettings(config: {
    tempThreshold: number;
    smokeThreshold: number;
    mqttHost: string;
    mqttPort: number;
    mqttTopic: string;
    mqttUser: string;
    mqttPass: string;
    mysqlApiEndpoint: string;
    mysqlDbHost: string;
    mysqlDbPort: number;
    mysqlDbName: string;
    mysqlDbUser: string;
    mysqlDbPass: string;
    scheduledSaveTime: string;
  }) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [CONFIG] Disimpan: MQTT Broker (${config.mqttHost}:${config.mqttPort}), MySQL (${config.mysqlDbHost}/${config.mysqlDbName}), Auto-Save History (${config.scheduledSaveTime})`,
    ];

    this.state = {
      ...this.state,
      ...config,
      mqttLogs: newLogs,
    };

    // Re-initialize MQTT connection if host/port/credentials changed
    this.initMqttConnection();
    this.fetchHistoryFromApi();
    this.notify();
  }
}

export const warehouseService = WarehouseService.getInstance();
