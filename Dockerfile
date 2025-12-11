# Stage 1: Build client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
# Cache bust to ensure fresh source is copied
ARG CACHE_BUST=unknown
RUN echo "Cache bust: $CACHE_BUST"
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy server build and dependencies
COPY server/package*.json ./
RUN npm ci --only=production
COPY --from=server-builder /app/server/dist ./dist

# Copy client build to be served as static files
COPY --from=client-builder /app/client/dist ./public

# Cloud Run uses PORT env variable
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/server.js"]
