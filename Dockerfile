# =============================================================================
# WebWidget Tool — All-in-one image
# Builds the React frontend and bundles it inside the Node.js backend.
# A single container serves both the dashboard SPA and the API.
# =============================================================================

# -------------------------------------------
# Stage 1 — Build frontend
# -------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY apps/frontend/package*.json ./
RUN npm install

COPY apps/frontend/ .

# In all-in-one mode the API is on the same origin, so VITE_API_URL is empty.
# The frontend falls back to window.location.origin automatically.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# -------------------------------------------
# Stage 2 — Build backend
# -------------------------------------------
FROM node:20-alpine AS backend-builder

RUN apk add --no-cache openssl

WORKDIR /app/backend

COPY apps/backend/package*.json ./
COPY apps/backend/prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY apps/backend/tsconfig.json ./
COPY apps/backend/src ./src
COPY apps/backend/public ./public

RUN npm run build

# -------------------------------------------
# Stage 3 — Runtime
# -------------------------------------------
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copy backend artifacts
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist         ./dist
COPY --from=backend-builder /app/backend/public       ./public
COPY --from=backend-builder /app/backend/prisma       ./prisma

# Embed the frontend build inside public/app/
# The backend will detect this folder and serve the SPA automatically.
COPY --from=frontend-builder /app/frontend/dist ./public/app

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
