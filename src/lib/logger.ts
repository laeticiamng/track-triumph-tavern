/**
 * Production-ready logging utility.
 * Wraps console methods with structured output and a debug mode toggle.
 *
 * Enable debug mode:  localStorage.setItem("wma-debug", "1")
 * Disable debug mode: localStorage.removeItem("wma-debug")
 */

function isDebug(): boolean {
  try {
    return localStorage.getItem("wma-debug") === "1";
  } catch {
    return false;
  }
}

function ts(): string {
  return new Date().toISOString();
}

export const logger = {
  /** Always logged — unexpected failures */
  error(context: string, ...args: unknown[]) {
    console.error(`[ERROR ${ts()}] ${context}`, ...args);
  },

  /** Always logged — degraded states */
  warn(context: string, ...args: unknown[]) {
    console.warn(`[WARN ${ts()}] ${context}`, ...args);
  },

  /** Only logged in debug mode */
  debug(context: string, ...args: unknown[]) {
    if (isDebug()) {
      console.log(`[DEBUG ${ts()}] ${context}`, ...args);
    }
  },

  /** API call logging — always log errors, debug for success */
  api(endpoint: string, payload?: unknown) {
    if (isDebug()) {
      console.log(`[API ${ts()}] →`, endpoint, payload ?? "");
    }
  },

  apiResponse(endpoint: string, response: unknown, error?: unknown) {
    if (error) {
      console.error(`[API ${ts()}] ✗`, endpoint, error);
    } else if (isDebug()) {
      console.log(`[API ${ts()}] ✓`, endpoint, response);
    }
  },
};
