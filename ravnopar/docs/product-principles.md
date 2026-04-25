# Product Principles

## Core

- Fair reach: svaki aktivni korisnik dobiva priliku za kontakt.
- No dead-end browsing: zauzeti parovi se privremeno uklanjaju iz primarnog feeda.
- Honest state: korisnik bira status (otvoren za kontakte, fokusiran kontakt, pauza).

## Kontakt logika

1. Korisnik A i B razmijene inicijalne poruke.
2. Ako obje strane oznace "zelim nastaviti", sustav ih oznaci kao `ENGAGED_PAIR`.
3. U statusu `ENGAGED_PAIR` profili se ne guraju novim korisnicima (osim ako sami ne prekinu).
4. Nakon prekida ili isteka neaktivnosti, status ide natrag u `AVAILABLE`.

## Anti-waste mehanizam

- Feed penalizira profile koji imaju previse otvorenih paralelnih razgovora bez odgovora.
- Novi kontakti prioritetno idu korisnicima koji su dugo bez kvalitetnog matcha.
