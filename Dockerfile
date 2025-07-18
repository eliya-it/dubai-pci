# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# RUN npm run build  # This will create dist/

# --- Stage 2: Production ---
# FROM node:20-alpine

# WORKDIR /app
# Only copy what's needed to run
# COPY --from=builder /app/package*.json ./
# RUN npm install --omit=dev
# COPY --from=builder /app/dist ./dist
EXPOSE 3000
# CMD ["node", "dist/server.js"]
CMD ["npm", "run","dev"]
