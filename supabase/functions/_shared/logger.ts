/**
 * Structured logger for Edge Functions.
 * Outputs JSON lines for easy parsing by log aggregators.
 * In development (non-production), also outputs human-readable format.
 */
const IS_PROD = Deno.env.get("ENVIRONMENT") === "production";

interface LogEntry {
  level: "info" | "warn" | "error";
  fn: string;
  msg: string;
  details?: Record<string, unknown>;
  ts: string;
}

function emit(entry: LogEntry) {
  const line = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function createLogger(fnName: string) {
  return {
    info(msg: string, details?: Record<string, unknown>) {
      emit({ level: "info", fn: fnName, msg, details, ts: new Date().toISOString() });
    },
    warn(msg: string, details?: Record<string, unknown>) {
      emit({ level: "warn", fn: fnName, msg, details, ts: new Date().toISOString() });
    },
    error(msg: string, details?: Record<string, unknown>) {
      emit({ level: "error", fn: fnName, msg, details, ts: new Date().toISOString() });
    },
  };
}
