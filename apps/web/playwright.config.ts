import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../../e2e",
  workers: 1,
  expect: { timeout: 15_000 },
  use: { baseURL: "http://127.0.0.1:3100", extraHTTPHeaders: { "x-e4f-admin-token": "local-e2e-only" }, launchOptions: { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] } },
  webServer: { command: "pnpm --filter @english4free/web start:e2e", url: "http://127.0.0.1:3100", reuseExistingServer: false, env: { ...process.env, E4F_E2E_ADMIN_TOKEN: "local-e2e-only" } }
});
