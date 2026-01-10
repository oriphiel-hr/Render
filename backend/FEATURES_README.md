# Uslugar Backend - trebam.hr Funkcionalnosti

## 🎉 Nove funkcionalnosti implementirane

### 1. **Upload Slika** 📸
- **Rute**: `/api/upload/single`, `/api/upload/multiple`, `/api/upload/:filename` (DELETE)
- **Lokacija**: `src/routes/upload.js`, `src/lib/upload.js`
- **Funkcionalnosti**:
  - Upload pojedinačne slike (max 5MB)
  - Upload više slika odjednom (max 10)
  - Podržani formati: JPEG, PNG, GIF, WEBP
  - Slike se spremaju u `./uploads` direktorij
  - Automatsko generiranje jedinstvenih imena (UUID)

**Primjer korištenja**:
```javascript
// Frontend upload
const formData = new FormData();
formData.append('image', file);
const response = await axios.post('/api/upload/single', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### 2. **Email Notifikacije** 📧
- **Lokacija**: `src/lib/email.js`, `src/lib/notifications.js`
- **Funkcionalnosti**:
  - Email obavijest o novom poslu (pružateljima)
  - Email obavijest o novoj ponudi (korisnicima)
  - Email obavijest o prihvaćenoj ponudi (pružateljima)
  - Email obavijest o recenziji
  - In-app notifikacije (baza podataka)

**Konfiguracija**: Postavite SMTP u `.env` fajlu:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. **Notifikacije Sustav** 🔔
- **Rute**: `/api/notifications`
- **Lokacija**: `src/routes/notifications.js`
- **Funkcionalnosti**:
  - GET `/api/notifications` - Dohvati sve notifikacije
  - GET `/api/notifications/unread-count` - Broj nepročitanih
  - PATCH `/api/notifications/:id/read` - Označi kao pročitano
  - PATCH `/api/notifications/mark-all-read` - Sve kao pročitano
  - DELETE `/api/notifications/:id` - Obriši notifikaciju

### 4. **Geolokacija** 🗺️
- **Lokacija**: `src/lib/geo.js`, ažuriran `src/routes/jobs.js`
- **Funkcionalnosti**:
  - Filtriranje poslova po udaljenosti
  - Haversine formula za precizno računanje distance
  - Sortiranje po udaljenosti

**Query parametri**:
```
GET /api/jobs?latitude=45.8150&longitude=15.9819&distance=50
// Traži poslove u radijusu od 50km od koordinata
```

**Dodatni filteri**:
- `urgency`: LOW, NORMAL, HIGH, URGENT
- `jobSize`: SMALL, MEDIUM, LARGE, EXTRA_LARGE
- `minBudget`, `maxBudget`: Raspon budžeta

### 5. **Real-time Chat** 💬
- **Rute**: `/api/chat`
- **Lokacija**: `src/routes/chat.js`, `src/lib/socket.js`
- **Socket.io integracija**
- **Funkcionalnosti**:
  - Kreiranje chat soba za poslove
  - Real-time razmjena poruka
  - Typing indikatori
  - Chat historia (spremljena u bazu)
  - Notifikacije za nove poruke

**Socket.io eventi**:
```javascript
// Frontend connection
const socket = io('http://localhost:4000', {
  auth: { token: authToken }
});

socket.emit('join-room', roomId);
socket.on('chat-history', (messages) => { /* ... */ });
socket.emit('send-message', { roomId, content: 'Hello!' });
socket.on('new-message', (message) => { /* ... */ });
```

### 6. **Freemium Model** 💳
- **Rute**: `/api/subscriptions`
- **Lokacija**: `src/routes/subscriptions.js`
- **Planovi**:
  - **BASIC** (€0): 5 ponuda mjesečno
  - **PREMIUM** (€19.99): 50 ponuda mjesečno + prioritet
  - **PRO** (€49.99): Neograničene ponude + VIP podrška

**API endpoints**:
- GET `/api/subscriptions/me` - Trenutna pretplata
- GET `/api/subscriptions/plans` - Svi dostupni planovi
- POST `/api/subscriptions/subscribe` - Pretplati se
- POST `/api/subscriptions/cancel` - Otkaži pretplatu
- GET `/api/subscriptions/can-send-offer` - Provjeri kredite

**Integracija s ponudama**:
- Svaki put kad pružatelj pošalje ponudu, automatski se oduzima kredit
- Ako nema kredita, vraća se greška `403 Insufficient credits`

## 📊 Ažurirana Prisma Schema

Nova polja i modeli:

```prisma
// User model - dodano
latitude, longitude, isVerified

// ProviderProfile - dodano
specialties[], experience, website, isAvailable

// Job model - dodano
latitude, longitude, urgency, jobSize, deadline, images[]

// Offer model - dodano
isNegotiable, estimatedDays

// Novi modeli
Notification, ChatRoom, ChatMessage, Subscription

// Novi enumovi
NotificationType, Urgency, JobSize
```

## 🚀 Pokretanje

### 1. Instalirajte dependencies:
```bash
cd uslugar/backend
npm install
```

### 2. Kreirajte `.env` fajl (kopirajte iz ENV_EXAMPLE.txt)

### 3. Pokrenite migracije:
```bash
npm run migrate:dev
```

### 4. Generirajte Prisma Client:
```bash
npm run prisma:generate
```

### 5. Pokrenite server:

**Windows**:
```bash
npm run dev
```
(Koristi `set NODE_ENV=development && node src/server.js`)

**Linux/Mac**:
```bash
npm run dev:unix
```

Server će pokrenuti na `http://localhost:4000`

## 🧪 Testiranje

### Health Check
```bash
curl http://localhost:4000/api/health
```

### Upload Test
```bash
curl -X POST http://localhost:4000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/image.jpg"
```

### Notifikacije Test
```bash
curl http://localhost:4000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Chat Test
```bash
# Get chat rooms
curl http://localhost:4000/api/chat/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create chat room
curl -X POST http://localhost:4000/api/chat/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "JOB_ID", "participantId": "USER_ID"}'
```

### Subscription Test
```bash
# Get current subscription
curl http://localhost:4000/api/subscriptions/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Subscribe to Premium
curl -X POST http://localhost:4000/api/subscriptions/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "PREMIUM"}'
```

## 📁 Struktura projekta

```
backend/
├── src/
│   ├── lib/
│   │   ├── auth.js          # JWT autentifikacija
│   │   ├── prisma.js        # Prisma client
│   │   ├── upload.js        # Multer konfiguracija
│   │   ├── email.js         # Nodemailer/SMTP
│   │   ├── notifications.js # Notifikacije helper
│   │   ├── socket.js        # Socket.io setup
│   │   └── geo.js           # Geolokacija funkcije
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js          # ✅ Ažurirano (geo filteri)
│   │   ├── offers.js        # ✅ Ažurirano (krediti)
│   │   ├── providers.js
│   │   ├── reviews.js
│   │   ├── admin.js
│   │   ├── upload.js        # 🆕 Novo
│   │   ├── notifications.js # 🆕 Novo
│   │   ├── chat.js          # 🆕 Novo
│   │   └── subscriptions.js # 🆕 Novo
│   └── server.js            # ✅ Ažurirano (Socket.io)
├── prisma/
│   └── schema.prisma        # ✅ Ažurirano
├── uploads/                 # 🆕 Upload direktorij
└── package.json
```

## 🔐 Sigurnost

- JWT autentifikacija za sve zaštićene rute
- File upload validacija (tip, veličina)
- CORS konfiguracija
- Socket.io autentifikacija
- Rate limiting (preporučeno dodati u produkciji)

## 🌟 Sljedeći koraci

1. ✅ Migracije baze podataka
2. ✅ Testiranje svih endpointa
3. ⏳ Frontend integracija
4. ⏳ Payment gateway integracija (Stripe/PayPal)
5. ⏳ Email template dizajn
6. ⏳ Push notifikacije (Firebase)
7. ⏳ AWS S3 za slike (umjesto lokalnog storage)

## 📞 Support

Za pitanja i probleme, kontaktirajte tim ili otvorite issue na GitHub-u.

