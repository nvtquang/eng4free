import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Serves the production build for a demo (`pnpm demo:start`) with the one-click demo account
 * enabled. Run `pnpm demo:prepare` first; it makes the build this command serves.
 */
if (!existsSync(resolve(process.cwd(), "apps/web/.next/BUILD_ID"))) {
  console.error("No production build found. Run pnpm demo:prepare (or pnpm build) first.");
  process.exit(1);
}
const result = spawnSync("pnpm", ["--filter", "@english4free/web", "start"], { stdio: "inherit", shell: true, env: { ...process.env, E4F_DEMO_SIGN_IN: "true" } });
process.exit(result.status ?? 0);
