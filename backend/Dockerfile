# Build phase
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Execution phase
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Boot command: wait for Postgres, apply migrations, seed, then start
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed || true && node dist/main"]
