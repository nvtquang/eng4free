const hits = new Map<string, { count: number; resetAt: number }>();
export function allowTutorRequest(key: string, limit = 10, windowMs = 60 * 60 * 1_000) { const now = Date.now(); const current = hits.get(key); if (!current || now >= current.resetAt) { hits.set(key, { count: 1, resetAt: now + windowMs }); return true; } if (current.count >= limit) return false; current.count += 1; return true; }
