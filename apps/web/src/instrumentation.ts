/**
 * Next.js calls onRequestError for every uncaught error while rendering a page, a route
 * handler or a server action; each one is logged and stored (see lib/observability).
 * The NEXT_RUNTIME check must wrap the import so the edge bundle leaves the database out.
 */
export async function onRequestError(error: unknown, request: { path: string; method: string }, context: { routerKind: string; routePath: string; routeType: string }) {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { captureError } = await import("@/lib/observability");
    await captureError(error, { source: "server", path: request.path, method: request.method, routeType: context.routeType, routePath: context.routePath });
  }
}
