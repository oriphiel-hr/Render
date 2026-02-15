# RegistarPoslovnihSubjekata – Node + Prisma (PostgreSQL)
FROM node:20-alpine

WORKDIR /app

# Ovisnosti
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Prisma shema i generiranje klijenta
COPY prisma ./prisma/
RUN npx prisma generate

# Aplikacija (kad dodaš API server, kopiraj ostale datoteke)
COPY . .

# Render zahtijeva proces koji sluša na PORT (inače "Application exited early")
# Pre-deploy: npx prisma migrate deploy ili db push (postavi u Render Pre-Deploy Command)
CMD ["node", "server.js"]
