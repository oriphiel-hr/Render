# Batch upis i ključ (SNAPSHOT_ID, REDNI_BROJ)

## 1. Paginirani / batch upis (dio po dio)

Kad ima puno redaka, upis u bazu radi se u **batch-evima** da se smanji veličina transakcije i rizik od timeouta.

### U checkpoint rollback-u

- Konstanta **INSERT_BATCH_SIZE** (npr. 500): `createMany` se zove po 500 redaka.
- Za svaku tablicu redaci se dijele u chunkove (`_chunk(parsed, INSERT_BATCH_SIZE)`), zatim u petlji:
  - `await model.createMany({ data: batch, skipDuplicates: true })`.
- Log: `table: batch 1/4 (500/2000 redaka)` itd.

### Opći pattern za kontinuirani upis

```js
const BATCH = 500;
for (let offset = 0; offset < total; offset += BATCH) {
  const chunk = rows.slice(offset, offset + BATCH);
  await prisma.someModel.createMany({ data: chunk, skipDuplicates: true });
}
```

---

## 2. REDNI_BROJ + SNAPSHOT_ID kao ključ (izbjegavanje duplikata)

Za tablice koje punimo iz vanjskog izvora po **snapshot-ima** (npr. API s `X-Snapshot-Id`), korisno je:

- **SNAPSHOT_ID** – identifikator seta podataka (npr. ID snapshota s API-ja).
- **REDNI_BROJ** – redni broj zapisa unutar tog snapshota: `REDNI_BROJ = offset + redni_broj_zapisa_u_batchu` (npr. za drugi batch od 1000: 1000, 1001, … 1999).

Zajedno **(SNAPSHOT_ID, REDNI_BROJ)** čine **jedinstveni par** pa možemo:

- raditi **upsert** po tom paru, ili
- **preskočiti** već upisane (idempotentan ponovljeni upis).

### Primjer sheme (Prisma)

```prisma
model SudregSyncRed {
  id          Int   @id @default(autoincrement())
  snapshotId  Int   // X-Snapshot-Id iz API-ja
  redniBroj   Int   // offset + indeks u batchu (0-based)
  payload     Json  // ostatak podataka
  createdAt   DateTime @default(now())

  @@unique([snapshotId, redniBroj])
}
```

### Primjer batch upisa s REDNI_BROJ

```js
const snapshotId = response.headers['x-snapshot-id']; // npr. 12345
let offset = 0;
let batch;
do {
  batch = await fetchPage(offset, 1000); // API s offset/limit
  const rows = batch.items.map((item, i) => ({
    snapshotId,
    redniBroj: offset + i,
    payload: item
  }));
  await prisma.sudregSyncRed.createMany({
    data: rows,
    skipDuplicates: true  // koristi @@unique(snapshotId, redniBroj)
  });
  offset += batch.items.length;
} while (batch.items.length === 1000);
```

Ako želiš **upsert** umjesto skipDuplicates (npr. ažurirati postojeći red):

- Prisma: `upsert` po jedinici u petlji, ili raw `INSERT ... ON CONFLICT (snapshot_id, redni_broj) DO UPDATE ...`.
- Ključ za izbjegavanje duplikata i dalje je **(SNAPSHOT_ID, REDNI_BROJ)**.

---

## Sažetak

| Što | Gdje |
|-----|------|
| Batch upis (dio po dio) | Checkpoint rollback koristi `INSERT_BATCH_SIZE` i `_chunk()`; općenito – petlja po `offset`/`limit` ili po chunkovima. |
| REDNI_BROJ | `offset + indeks_u_batchu` pri pripremi redaka. |
| SNAPSHOT_ID + REDNI_BROJ | Jedinstveni par u tablici (`@@unique`); omogućuje `skipDuplicates` ili upsert i idempotentan ponovljeni upis. |
