# Review Fields Auto-Fix - Implementacija

## Pregled

Auto-fix funkcija `ensureReviewFields()` automatski dodaje nedostajuća polja u `Review` tabelu kada server starta, riješavajući grešku `The column Review.isPublished does not exist`.

## Implementacija

### Auto-Fix Funkcija

**File:** `src/server.js`

Funkcija `ensureReviewFields()` se automatski poziva pri pokretanju servera i:

1. **Provjerava** da li `isPublished` kolona postoji
2. **Ako ne postoji**, automatski dodaje:
   - Enume: `ModerationStatus`, `ReportStatus`
   - RECIPROCAL DELAY polja: `isPublished`, `publishedAt`, `reviewDeadline`
   - REPLY polja: `replyText`, `repliedAt`, `hasReplied`
   - MODERATION polja: `moderationStatus`, `moderationReviewedBy`, `moderationReviewedAt`, `moderationRejectionReason`, `moderationNotes`
   - REPORT polja: `isReported`, `reportedBy`, `reportedAt`, `reportReason`, `reportStatus`, `reportReviewedBy`, `reportReviewedAt`, `reportReviewNotes`
   - Indekse za sva nova polja

### Kako Funkcionira

```javascript
async function ensureReviewFields() {
  try {
    // Provjeri da li kolona postoji
    await prisma.$queryRaw`SELECT "isPublished" FROM "Review" LIMIT 1`
    console.log('✅ Review fields exist')
  } catch (error) {
    if (error.message.includes('does not exist')) {
      // Automatski dodaj sva nedostajuća polja
      // ...
    }
  }
}
```

### Deployment

**GitHub Actions Workflow:** `.github/workflows/prisma-uslugar.yml`

Workflow automatski:
1. Build & push Docker image
2. Pokreće Prisma migracije
3. Deploy na ECS
4. **Server.js auto-fix automatski dodaje kolone pri prvom pokretanju!**

### Prednosti

- ✅ **Automatski** - Nema potrebe za ručnim SQL migracijama
- ✅ **Sigurno** - Koristi `IF NOT EXISTS` pa neće baciti grešku ako kolone već postoje
- ✅ **Brzo** - Riješava problem pri prvom pokretanju servera
- ✅ **Robustno** - Radi čak i ako migracije nisu primijenjene

### Status

✅ **Implementirano:**
- Auto-fix funkcija dodana u `server.js`
- Workflow ažuriran da uključi `server.js` promjene
- Migracija kreirana (`20251201000000_add_review_fields`)

### Sljedeći Korak

Commit i push promjene:

```bash
git add uslugar/backend/src/server.js .github/workflows/prisma-uslugar.yml
git commit -m "fix: add auto-fix for Review fields (isPublished, moderationStatus, etc.)"
git push origin main
```

GitHub Actions će automatski:
1. Deploy novi server.js s auto-fix funkcijom
2. Pri prvom pokretanju, auto-fix će dodati nedostajuća polja
3. Greška `Review.isPublished does not exist` će biti riješena!

