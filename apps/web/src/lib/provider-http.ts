export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

function timeoutMs(value: string | undefined, fallback = 12_000): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Server-only JSON client for provider adapters. Provider credentials never reach the browser. */
export async function postProviderJson(url: string, body: unknown, options: { apiKey?: string; apiKeyHeader?: string; timeout?: string; unavailableMessage: string }): Promise<unknown> {
  try {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (options.apiKey) headers[options.apiKeyHeader ?? "authorization"] = options.apiKeyHeader ? options.apiKey : `Bearer ${options.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs(options.timeout))
    });
    if (!response.ok) throw new ProviderUnavailableError(`${options.unavailableMessage} (${response.status})`);
    return await response.json();
  } catch (error) {
    if (error instanceof ProviderUnavailableError) throw error;
    throw new ProviderUnavailableError(options.unavailableMessage);
  }
}
