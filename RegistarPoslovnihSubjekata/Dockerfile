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

# DATABASE_URL se postavlja u runtime (env ili secrets)
# Za samo migracije: CMD ["npx", "prisma", "migrate", "deploy"]
# Za db push:       CMD ["npx", "prisma", "db", "push"]
# Kad imaš server:  CMD ["node", "server.js"]
CMD ["npx", "prisma", "generate"]
