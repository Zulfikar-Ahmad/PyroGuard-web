import { LogRecord, SystemStatus, TelemetryState } from '../types';

type Listener = (state: TelemetryState) => void;

class WarehouseService {
  private static instance: WarehouseService;
  private listeners: Set<Listener> = new Set();
  private timer: number | null = null;
  private logCounter = 1;

  private state: TelemetryState = {
    temperature: 28.5,
    humidity: 62.0,
    smoke: 12.0,
    flameDetected: false,
    systemStatus: 'Aman',
    tempThreshold: 45.0,
    smokeThreshold: 30.0,
    wifiSsid: 'PyroGuard_Warehouse_5G',
    wifiPass: 'GudangUtama2024!',
    espIpAddress: '192.168.1.105',
    mqttPort: 1883,
    nanoStatus: 'Active (UART Sync OK)',
    exhaustFan: false,
    sprinkler: false,
    sirenAlarm: false,
    isEmergencyMode: false,
    isPaused: false,
    tempHistory: [27.0, 27.5, 28.0, 28.2, 28.5, 28.1, 28.4, 28.5],
    humHistory: [60, 61, 62, 63, 62, 61, 62, 62],
    timeHistory: ['10:00:00', '10:00:05', '10:00:10', '10:00:15', '10:00:20', '10:00:25', '10:00:30', '10:00:35'],
    logRecords: [],
    mqttLogs: [
      `[${this.formatTime(new Date())}] [MQTT CONNECTED] Connected to broker 192.168.1.105:1883`,
      `[${this.formatTime(new Date())}] [UART] Arduino Nano V3 Sync OK`,
      `[${this.formatTime(new Date())}] [PUBLISH] warehouse/sensors/telemetry -> Temp:28.5C Hum:62% Smoke:12%`,
    ],
  };

  private constructor() {
    this.addLogRecord(this.state.temperature, this.state.humidity, this.state.smoke, this.state.flameDetected, 'Aman');
    this.startSimulation();
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

  private formatTime(date: DateTimeFormatInput = new Date()): string {
    const d = new Date(date);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  private startSimulation() {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => {
      this.tickSimulation();
    }, 1000);
  }

  private tickSimulation() {
    if (this.state.isPaused) return;

    let temp = this.state.temperature;
    let hum = this.state.humidity;
    let smoke = this.state.smoke;
    let flame = this.state.flameDetected;
    let fan = this.state.exhaustFan;
    let sprinkler = this.state.sprinkler;
    let siren = this.state.sirenAlarm;

    if (this.state.isEmergencyMode) {
      temp = Math.min(85, temp + 1.2);
      hum = Math.max(20, hum - 0.8);
      smoke = Math.min(95, smoke + 2.5);
      flame = true;
      siren = true;
      fan = true;
      sprinkler = true;
    } else {
      // Normal random fluctuation
      temp += (Math.random() - 0.48) * 0.4;
      hum += (Math.random() - 0.5) * 0.8;
      smoke += (Math.random() - 0.52) * 0.3;

      // Bound ranges
      temp = Math.max(18, Math.min(65, temp));
      hum = Math.max(30, Math.min(95, hum));
      smoke = Math.max(5, Math.min(80, smoke));

      // Auto safety triggers
      if (temp >= this.state.tempThreshold || smoke >= this.state.smokeThreshold) {
        fan = true;
      }
    }

    // Determine status
    let status: SystemStatus = 'Aman';
    if (flame || this.state.isEmergencyMode) {
      status = 'Bahaya';
    } else if (temp >= this.state.tempThreshold || smoke >= this.state.smokeThreshold) {
      status = 'Peringatan';
    }

    const nowStr = this.formatTime();

    // Update history
    const newTempHistory = [...this.state.tempHistory.slice(-14), Number(temp.toFixed(1))];
    const newHumHistory = [...this.state.humHistory.slice(-14), Number(hum.toFixed(0))];
    const newTimeHistory = [...this.state.timeHistory.slice(-14), nowStr];

    // MQTT telemetry log periodically
    const newMqttLogs = [...this.state.mqttLogs];
    if (Math.random() > 0.7 || status !== this.state.systemStatus) {
      newMqttLogs.push(
        `[${nowStr}] [PUBLISH] warehouse/sensors/telemetry -> Temp:${temp.toFixed(1)}°C Hum:${hum.toFixed(0)}% Smoke:${smoke.toFixed(0)}% Status:${status}`
      );
      if (newMqttLogs.length > 50) newMqttLogs.shift();
    }

    this.state = {
      ...this.state,
      temperature: temp,
      humidity: hum,
      smoke: smoke,
      flameDetected: flame,
      systemStatus: status,
      exhaustFan: fan,
      sprinkler: sprinkler,
      sirenAlarm: siren,
      tempHistory: newTempHistory,
      humHistory: newHumHistory,
      timeHistory: newTimeHistory,
      mqttLogs: newMqttLogs,
    };

    // Add log record every 5 ticks or when status changes
    if (this.logCounter++ % 5 === 0 || status !== this.state.systemStatus) {
      this.addLogRecord(temp, hum, smoke, flame, status);
    } else {
      this.notify();
    }
  }

  private addLogRecord(temp: number, hum: number, smoke: number, flame: boolean, status: SystemStatus) {
    const record: LogRecord = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      timeFormatted: `${this.formatTime()} WIB`,
      temperature: Number(temp.toFixed(1)),
      humidity: Number(hum.toFixed(0)),
      smoke: Number(smoke.toFixed(0)),
      flameDetected: flame,
      status: status,
    };

    const newRecords = [record, ...this.state.logRecords.slice(0, 49)];
    this.state = {
      ...this.state,
      logRecords: newRecords,
    };
    this.notify();
  }

  // Action methods
  public togglePause() {
    this.state = { ...this.state, isPaused: !this.state.isPaused };
    this.notify();
  }

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
      `[${timeStr}] [EMERGENCY] 🔥 SIMULASI ALARM KEBAKARAN DITRIGGER!`,
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
    this.addLogRecord(this.state.temperature, this.state.humidity, this.state.smoke, true, 'Bahaya');
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
      temperature: 28.5,
      humidity: 62.0,
      smoke: 12.0,
      systemStatus: 'Aman',
      mqttLogs: newLogs,
    };
    this.addLogRecord(28.5, 62.0, 12.0, false, 'Aman');
  }

  public clearMqttLogs() {
    this.state = { ...this.state, mqttLogs: [] };
    this.notify();
  }

  public clearHistory() {
    this.state = { ...this.state, logRecords: [] };
    this.notify();
  }

  public updateSettings(tempThreshold: number, smokeThreshold: number, wifiSsid: string, wifiPass: string) {
    const timeStr = this.formatTime();
    const newLogs = [
      ...this.state.mqttLogs,
      `[${timeStr}] [CONFIG] Wi-Fi SSID updated to '${wifiSsid}', Temp limit: ${tempThreshold}°C, Smoke limit: ${smokeThreshold}%`,
    ];
    this.state = {
      ...this.state,
      tempThreshold,
      smokeThreshold,
      wifiSsid,
      wifiPass,
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

type DateTimeFormatInput = string | number | Date;

export const warehouseService = WarehouseService.getInstance();
