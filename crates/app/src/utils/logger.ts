type LogLevel = "error" | "warn" | "info" | "debug";
type LogLevelDisplay = "ERROR" | "WARN" | "INFO" | "DEBUG";

interface LogEntry {
  ts: string;
  level: LogLevelDisplay;
  target: string;
  msg: string;
  fields?: Record<string, unknown>;
}

function emit(level: LogLevel, target: string, msg: string, fields?: Record<string, unknown>) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level: level.toUpperCase() as LogLevelDisplay,
    target,
    msg,
  };
  if (fields && Object.keys(fields).length > 0) {
    entry.fields = fields;
  }
  const payload = `[brainmap] ${JSON.stringify(entry)}`;
  switch (level) {
    case "error":
      console.error(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    case "info":
      console.info(payload);
      break;
    case "debug":
      console.debug(payload);
      break;
  }
}

export const log = {
  error: (target: string, msg: string, fields?: Record<string, unknown>) =>
    emit("error", target, msg, fields),
  warn: (target: string, msg: string, fields?: Record<string, unknown>) =>
    emit("warn", target, msg, fields),
  info: (target: string, msg: string, fields?: Record<string, unknown>) =>
    emit("info", target, msg, fields),
  debug: (target: string, msg: string, fields?: Record<string, unknown>) =>
    emit("debug", target, msg, fields),
};
