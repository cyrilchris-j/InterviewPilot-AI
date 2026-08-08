FROM node:20-alpine AS builder

WORKDIR /app

# Copy root config and package lock
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY shared ./shared

# Install all dependencies (dev included for build)
RUN npm ci

# Copy server source
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
COPY server/data ./server/data

# Build server
RUN npm run build --workspace server

# Prune dev dependencies
RUN npm ci --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/data ./server/data

EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "server"]
