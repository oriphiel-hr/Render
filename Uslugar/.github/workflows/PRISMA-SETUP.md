# Prisma i baza (lokalno / deploy)

**Napomena:** u repou **nema** zasebnog GitHub workflowa za Prisma. Migracije pokrećete lokalno ili u deploy pipelineu (npr. Render) s `DATABASE_URL` iz tajni okoline — **ne** commitajte stvarne connection stringove u git.

## `prisma validate` bez baze (P1012: `DATABASE_URL` not found)

`prisma validate` traži varijablu u okruženju, ali ne spaja se na bazu. Dovoljan je lažni connection string.

**PowerShell:**

```powershell
$env:DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
npx prisma validate --schema=prisma/schema.prisma
```

**bash:**

```bash
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma validate --schema=prisma/schema.prisma
```

## GitHub Actions secret

Ako neki drugi workflow (npr. deploy) treba `DATABASE_URL`, postavite ga u **Settings → Secrets and variables → Actions** (vrijedost ne spominjati u repou).

## Rotacija vjerodajnica

Ako su vjerodajnice za bazu ikad bile u commitanom dokumentu, u **Render** / hostingu generirajte **novi** connection string i stari učinite nevaljanim.
