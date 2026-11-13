FROM node:22-alpine AS build
WORKDIR /app

# Native build deps for bcrypt if prebuilds are unavailable on a given arch
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json apps/api/tsconfig.build.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci

COPY packages/shared/src ./packages/shared/src
COPY apps/api/src ./apps/api/src
COPY apps/api/db ./apps/api/db

RUN npm run build -w @clinicflow/shared \
 && npm run build -w @clinicflow/api \
 && cp -r apps/api/db/migrations apps/api/dist/db/migrations

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist

USER node
WORKDIR /app/apps/api
EXPOSE 4000

CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed.js --if-empty && node dist/src/server.js"]
