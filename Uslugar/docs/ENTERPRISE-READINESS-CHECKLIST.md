# Uslugar — „enterprise” slojevi: što to znači i što dobivate

Dokument za kasniju upotrebu: konkretne isporuke po temi i poslovna korist. Nije obveza implementacije — već **mapa** kad se odlučuje o pristupačnosti, lokalizaciji, podršci, SEO-u, sigurnosti i DSGVO-u.

---

## 1. Pristupačnost (a11y, npr. WCAG 2.1 AA u praksi)

**Što bi radili:** audit ekrana (kontrast, fokus, tipke, forme, slike s `alt`, zaglavlja, čitač ekrana), ispravke u webu i u mobilu (React Native / Expo), testiranje s VoiceOver / TalkBack, checklist na svakom novom ekranu.

**Što dobivate:** manje pravnih i reputacijskih rizika (pristup javnim uslugama, B2B tenderi), šira publika, bolji SEO (preklapanje s tehničkim kvalitetom), često bolji UX i za ostale korisnike (jasnija navigacija).

---

## 2. Potpuna lokalizacija (i18n)

**Što bi radili:** ukloniti tvrdo ugrađene stringove, `hr` + barem `en` (ponekad i `de` za regiju), format datuma/valute, RTL ako ikad treba, prijevod pravnih stranica, sinhron s backend porukama i e-mailovima.

**Što dobivate:** ulazak na tržišta bez mješavine jezika, manje odbijanja, jednostavnija podrška, bolji dojam proizvoda. **Nije** automatski SEO (to je zasebno), ali pomaže sadržaju na više jezika.

---

## 3. Podrška 24/7

**Što bi radili:** ugovor s BPO-om / call centrom, ili rotacija, tiket sustav (Zendesk, Intercom, Freshdesk), osnovne skripte, SLA po prioritetima, handoff na unutarnji tim za sporove, noćni on-call za incidente (puno češće noću **tehnički** nego „svaki upit”).

**Što dobivate:** brže zatvaranje reklamacija, manje negativnih recenzija, dojam ozbiljne platforme. **Trošak** raste linearno — 24/7 za sve je skup; **hibrid** je uobičajen: 24/7 samo za kritični kanal ili prošireni vikend.

---

## 4. SEO masovno

**Što bi radili:** tehnički SEO (brzina, Core Web Vitals, strukturirani podatci, `sitemap`, canonical, indeksacija), sadržaj: **landing** po gradu + kategoriji + nameri („cijene“, „pronalazak majstora”), unutarnje poveznice, blog/FAQ gdje ima smisla, Google Search Console, praćenje upita.

**Napomena:** ovo je i **trgovački i redakcijski** posao, ne samo programerski. „Masovno” = puno stranica + ažuriranja + ponekad povezivanja (PR).

**Što dobivate:** organski promet, niži CAC, više upita/leadova bez oglasa — **rezultat s vremenom**, nakon indeksa i (često) angažmana na sadržaj.

---

## 5. Sigurnosni audit

**Što bi radili:** vanjski pentest (ili ozbiljna unutarnja provjera) na API + webu + mobilu, pregled ovisnosti, tajne u vaultu, rate limit, CORS, autentikacija, uploadi, logovi bez PII, plan incident response, ponavljanje nakon većih promjena.

**Što dobivate:** manja vjerojatnost curenja podataka i teškog incijenta, bolji odnos s B2B partnerima i investitorima, često povoljniji uvjeti osiguranja.

---

## 6. Formalni DSGVO paket

**Što bi radili:** pravne dokumente usklađene s obradom (Izpisi obrade, pravna osnova, ugovori s obveznicima DPA), politika zadržavanja, PIA / evidencija obrade gdje treba, prava korisnika (pristup, brisanje, ispravak) **kroz proizvod ili jasan proces**, DPA s izvršiteljima (hosting, e-pošta, Stripe, …), postupak u slučaju incijenta.

**Što dobivate:** manji rizik kazni i pritužbi; B2B često traži ovo prije suradnje. Ne jamči apsolutnu bezbjednost, ali daje **dokazljivu** usklađenost u ulozi.

---

## Sve skupa — što stvarno „dobivate“

- Ovi slojevi **smanjuju rizike** i **šire kanal** (SEO, tržišta, tenderi) i pomažu održati reputaciju uz rast.
- Cijena je u **ljudskim satima + alati + pravnici**; nije u pravilu „jedan sprint”.

### Prioritizacija s dobrom cijena–učinak (prijedlog, ne pravilnik)

1. Tehnički SEO + sadržaj **fokusno** (ne 10 000 stranica odjednom).
2. DSGVO vidljiv korisnicima (dokumenti + ostvariva prava).
3. Pristupačnost **po fazama** (kritični tokovi prvi).
4. Sigurnosni audit **prije** veće ekspanzije ili nakon značajnih promjena.
5. Podrška 24/7 kad broj korisnika i ozbiljnost posla to opravdavaju (često hibrid).

### Faza rane rasti (mali budžet) — što je realno sada

Gornji odlomci opisuju **kamo** ide proizvod kad stigne red; nisu nalog da se sve plati odmah. Ako **tek skupljate** prve korisnike, investitore ili opipljiv promet, smisleno je:

| Tema | Skupo / kasnije | **Malo-novac sada** |
|------|-----------------|---------------------|
| a11y | Vanjski audit, potpuna AA | Fokus na **ključnim** tokovima (prijava, posao, plaćanje pretplate), kontrast i labeli; ostalo kasnije |
| i18n | Potpuna višejezičnost | **Samo HR** u proizvodu, jasni engleski u pitchu / investitorskom one-pageru po potrebi |
| Podrška | 24/7, BPO | **E-mail** + navedeno radno vrijeme, predlošci odgovora, jeftin / besplatan live-chat ako treba, incidenti ručno |
| SEO | Agencija, tisuće stranica | **Jedan** kvalitetan grad + **jedna** kategorija, GSC, tehnički osnovi (brzina, `title`/`description`) |
| Sigurnost | Pentest | Osvježavati ovisnosti, tajne u envu, `npm audit` / Snyk free tier, brzi pregled auth/upload ruta |
| DSGVO | Odvjetnik + puni RoPA | Standardni **predlošci** + jasna politika, obrazac „obriši moje podatke“ preko e-maila (dok nije u appu) |

**Zaključak:** Cijela lista iznad = **karta za budućnost**, ne račun za ovu fazu. Kad promet i tim porastu, vraćate se sekcijama 1–6 s više gotovine. Do tada, **rana faza = manje kliše „scale-upa”, više razgovora s korisnicima i stabilan proizvod**.

---

*Ažurirajte ovaj dokument kad se odluči što je stvarno u kalendaru; veza s konkurentskim kontekstom: [COMPETITIVE-FEATURES-MATRIX.md](COMPETITIVE-FEATURES-MATRIX.md), [PLATFORM-SCOPE-STATUS.md](PLATFORM-SCOPE-STATUS.md).*
