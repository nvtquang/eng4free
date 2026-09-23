type Event = { name: string; properties?: Record<string, string | number | boolean> };
export function captureEvent(event: Event) { if (process.env.NODE_ENV !== "production") console.info(`[analytics] ${event.name}`, event.properties ?? {}); }
export function captureError(error: unknown, context?: Record<string, string | number | boolean>) { const message = error instanceof Error ? error.message : "Unknown error"; console.error("[error]", message, context ?? {}); }
