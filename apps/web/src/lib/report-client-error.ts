/** Sends an error the browser displayed to /api/telemetry/error; failures are ignored. */
export function reportClientError(error: Error & { digest?: string }) {
  // A digest means the error came from the server, where onRequestError has already stored it.
  if (error.digest) return;
  const body = JSON.stringify({ message: error.message.slice(0, 1_000), path: window.location.pathname });
  void fetch("/api/telemetry/error", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}
