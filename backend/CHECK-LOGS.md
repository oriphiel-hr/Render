# Provjera CloudWatch Logs

## Log Group
`/ecs/uslugar` (ne `/ecs/uslugar/backend`)

## Što tražiti:

1. **Poruke o registraciji endpointa:**
   - `🔍 Registering /migration-status-test endpoint`
   - `🔍 Registering /migration-status endpoint`
   - `🔍 Admin router loaded, total routes: X`

2. **Poruke kada se endpoint pozove:**
   - `✅ /migration-status-test endpoint called`
   - `✅ /migration-status endpoint called`

3. **Greške:**
   - `Error`
   - `SyntaxError`
   - `Cannot`
   - `Failed`

## Kako provjeriti:

1. Otvori AWS Console → CloudWatch → Log groups
2. Klikni na `/ecs/uslugar`
3. Odaberi najnoviji log stream
4. Traži poruke s `🔍` i `✅`
5. Provjeri da li postoje greške prije poruka o registraciji

## Ako ne vidiš poruke o registraciji:

- Endpointi se ne registriraju (runtime greška prije njih)
- Provjeri greške u logs-ima prije poruka o registraciji

## Ako vidiš poruke o registraciji ali ne o pozivima:

- Endpointi su registrirani ali ne rade
- Provjeri da li postoji problem s routing-om

