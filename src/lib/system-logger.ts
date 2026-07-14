export interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warn" | "error";
}

type LogListener = (logs: LogEntry[]) => void;

class SystemLogger {
  private logs: LogEntry[] = [];
  private listeners = new Set<LogListener>();

  constructor() {
    this.log("System initialization sequence started", "info");
  }

  log(message: string, type: LogEntry["type"] = "info") {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const entry: LogEntry = { timestamp: time, message, type };
    this.logs = [entry, ...this.logs].slice(0, 50); // Keep last 50 logs
    this.listeners.forEach((l) => l(this.logs));
  }

  getLogs() {
    return this.logs;
  }

  subscribe(listener: LogListener) {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const systemLogger = new SystemLogger();
