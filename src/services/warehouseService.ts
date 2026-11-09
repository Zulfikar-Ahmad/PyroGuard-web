import { LogRecord, SystemStatus, TelemetryState } from '../types';

type Listener = (state: TelemetryState) => void;

class WarehouseService {
  private static instance: WarehouseService;
  private listeners: Set<Listener> = new Set();
  private connectionTimer: number | null = null;
  private scheduleCheckTimer: number | null = null;
  private lastSavedDate: string = '';

  /*
   * ============================================================================
   * CONFIGURATION KEYS FOR MQTT BROKER & MYSQL DATABASE / REST API
   * ============================================================================
   * 1. MQTT Broker Details (Cloudflare Tunnel to Docker VM):
   *    - Domain/Host: mqttHost (default: "mqtt.pyroguard.app")
   *    - Port: mqttPort (default: 443 / 8083 WSS)
   *    - Username: mqttUser (default: "pyroadmin")
   *    - Password: mqttPass (default: "pyroguard371")
   *    - Topic: mqttTopic (default: "warehouse/sensors/telemetry")
   *
   * 2. MySQL / Backend API Details:
   *    - API Endpoint: mysqlApiEndpoint (default: "https://api.pyroguard.app/api/history")
   *    - Database Host: mysqlDbHost (default: "127.0.0.1")
   *    - Database Name: mysqlDbName (default: "pyroguard_db")
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

    // MQTT Configuration (Cloudflare Tunnel to Docker VM)
    mqttHost: 'mqtt.pyroguard.app',
    mqttPort: 443,
    mqttTopic: 'warehouse/sensors/telemetry',
    mqttUser: 'pyroadmin',
    mqttPass: 'pyroguard371',

    // MySQL / Database Configuration
    mysqlApiEndpoint: 'https://api.pyroguard.app/api/history',
    mysqlDbHost: '127.0.0.1',
    mysqlDbPort: 3306,
    mysqlDbName: 'pyroguard_db',
    mysqlDbUser: 'pyroguard_user',
    mysqlDbPass: 'pyroguard_pass',

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
      `[${this.formatTime(new Date())}] [SYSTEM] Memulai sistem monitoring MQTT & MySQL...`,
      `[${this.formatTime(new Date())}] [INFO] Menghubungkan ke Broker Cloudflare Tunnel mqtt.pyroguard.app:443 (User: pyroadmin)...`,
      `[${this.formatTime(new Date())}] [INFO] Menunggu aliran data stream dari ESP32-S3 (Topic: warehouse/sensors/telemetry)...`,
    ],
  };

  private constructor() {
    this.startScheduleChecker();
    this.initMqttConnection();
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
   * Initialize MQTT Connection & Message Listener
   */
  private initMqttConnection() {
    const timeStr = this.formatTime();
    const log = `[${timeStr}] [MQTT] Menghubungkan ke Cloudflare Broker Tunnel wss://${this.state.mqttHost}:${this.state.mqttPort} (User: ${this.state.mqttUser})...`;
    this.state.mqttLogs = [...this.state.mqttLogs, log];
    this.notify();

    // Setup periodic heart-beat connection timeout check
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
    // If no stream data has arrived or device is marked offline
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
      `[${timeStr}] ${sourceLabel} Menyimpan rekaman histori (Temp:${record.temperature}°C, Status:${record.status}) ke Database MySQL ${this.state.mysqlDbHost}:${this.state.mysqlDbPort}/${this.state.mysqlDbName}...`,
    ];

    this.state = {
      ...this.state,
      logRecords: newRecords,
      mqttLogs: logs,
    };
    this.notify();

    // Async call to MySQL / REST API
    this.syncRecordToMysqlDatabase(record);
  }

  /*
   * Backend Sync Function: Send LogRecord to MySQL Database via REST API
   */
  private async syncRecordToMysqlDatabase(record: LogRecord) {
    try {
      if (this.state.mysqlApiEndpoint && this.state.mysqlApiEndpoint.startsWith('http')) {
        await fetch(this.state.mysqlApiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: record.timeFormatted,
            temperature: record.temperature,
            humidity: record.humidity,
            smoke: record.smoke,
            flame_detected: record.flameDetected,
            status: record.status,
            db_host: this.state.mysqlDbHost,
            db_name: this.state.mysqlDbName,
          }),
        });
      }
    } catch (err) {
      console.warn('MySQL API sync error:', err);
    }
  }

  // Actuator Actions
  public setExhaust(value: boolean) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [PUBLISH] warehouse/actuator/fan -> ${value ? 'ON' : 'OFF'}`,
    ];
    this.state = { ...this.state, exhaustFan: value, mqttLogs: newLogs };
    this.notify();
  }

  public setSprinkler(value: boolean) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [PUBLISH] warehouse/actuator/sprinkler -> ${value ? 'ON' : 'OFF'}`,
    ];
    this.state = { ...this.state, sprinkler: value, mqttLogs: newLogs };
    this.notify();
  }

  public setSiren(value: boolean) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [PUBLISH] warehouse/actuator/siren -> ${value ? 'ACTIVE' : 'STANDBY'}`,
    ];
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

    this.notify();
  }

  public exportCsvData(): string {
    let csv = 'Waktu,Suhu (C),Kelembapan (%),Asap (%),Flame,Status\n';
    this.state.logRecords.forEach((rec) => {
      csv += `${rec.timeFormatted},${rec.temperature},${rec.humidity},${rec.smoke},${rec.flameDetected ? 'YA' : 'TIDAK'},${rec.status}\n`;
    });
    return csv;
  }
}

export const warehouseService = WarehouseService.getInstance();
