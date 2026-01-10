# ---------- PRISMA CLIENT BUILD (generira node_modules/.prisma + @prisma/*) ----------
FROM node:20-bookworm-slim AS prisma-src
WORKDIR /app

# 1) deps (uklj. dev → trebamo Prisma CLI za generate)
COPY package*.json ./
RUN npm ci

# 2) schema (i po potrebi migrations)
COPY prisma ./prisma
# Ako tvoj schema.ts referencira codegen iz src/, odkomentiraj sljedeću liniju:
# COPY src ./src

# 3) generate
RUN npx prisma generate
# --------------------------------------------------------------------------------------

# ------------------------------- RUNTIME (production) --------------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install OpenSSL 3.0 for Prisma
RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*

# prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# app source
COPY src ./src

# Copy prisma directory for migrations and seeds
COPY prisma ./prisma

# Copy migration runner script
COPY run-migration.js ./run-migration.js

# kopiraj generirani Prisma client iz build stage-a
COPY --from=prisma-src /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=prisma-src /app/node_modules/@prisma ./node_modules/@prisma

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x /app/start.sh

# tvoj server sluša na 8080
EXPOSE 4000
CMD ["/app/start.sh"]
# --------------------------------------------------------------------------------------
