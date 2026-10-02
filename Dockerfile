# syntax=docker/dockerfile:1.7
# English 4 Free web app.
#   docker build --target runner -t english4free-web .   the server (Next.js standalone, ~250 MB)
#   docker build --target tools  -t english4free-tools .  migrations, content import, maintenance jobs
# Both read their configuration from the environment at run time (see apps/web/.env.example).

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@9.15.5 --activate
WORKDIR /repo

FROM base AS tools
COPY . .
RUN pnpm install --frozen-lockfile
# The standalone output is used only by the runner stage; build-time values are placeholders,
# real ones are read at run time.
RUN NEXT_OUTPUT=standalone DATABASE_URL=postgresql://build:build@localhost:5432/english4free AUTH_SECRET=build-only \
    pnpm --filter @english4free/web build
CMD ["pnpm", "db:migrate"]

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=tools --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=tools --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=tools --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
WORKDIR /app/apps/web
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
