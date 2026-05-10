# Meta Messenger Scope Plan

Ovaj dokument je kratki "single source of truth" za trenutno stanje Meta dozvola i plan širenja.

## Trenutni cilj (faza 1)

Messenger webhook + spremanje poruka u bazu + baza za AI promptove.

## Aktivno sada (minimalni set)

- `pages_messaging` — slanje/primanje Messenger poruka za Facebook Page.
- `pages_manage_metadata` — webhook pretplate i Meta postavke vezane uz Page webhook.
- `pages_show_list` — dohvat liste stranica (`/me/accounts`).
- `public_profile` — osnovni profil (standardno dostupno).

## Namjerno izostavljeno (faza 1)

### Page content / moderacija / analitika

Ovdje su dozvole koje diraju **Facebook Page** (objave, komentari, uvidi), ne sam Messenger razgovor.

**Čitanje Page sadržaja / engagementa**

- `pages_read_engagement` — čitanje objava/medija koje je objavila stranica, follower podataka, profilne slike stranice, metapodataka i dijela uvida o stranici. Za čisti Messenger webhook + AI odgovor u inboxu **često nije potrebno**; uključiti tek kad u kodu stvarno čitaš taj sadržaj.

**UGC na stranici**

- `pages_read_user_content` — čitanje user-generated sadržaja na Pageu (komentari, ocjene, postovi drugih).

**Pisanje / moderacija**

- `pages_manage_posts` — objave na stranici (create/edit/delete).
- `pages_manage_engagement` — moderacija komentara i engagement akcije.

**Insights API (brojčani izvještaji)**

- `read_insights` — formalniji pristup Insights podacima za Page/app/domena (šire od onoga što pokriva samo `pages_read_engagement` u praksi).

**Utility poruke (predlošci)**

- `pages_utility_messaging` — utility messaging templates (servisne predloške poruka).

### Instagram

- `instagram_basic` — osnovni Instagram profil/mediji.
- `instagram_manage_messages` — Instagram DM poruke.

### WhatsApp

- WhatsApp use case i WhatsApp Business Platform nisu dio ove faze.
- WhatsApp webhook/token tokovi nisu uključeni u ovu Messenger konfiguraciju.

### Ads / marketing automation

- `ads_management` — ad account i kampanje preko API-ja.
- `marketing_messages_messenger` — plaćene marketinške Messenger poruke (API).
- `paid_marketing_messages` — paid marketing poruke capability.
- `facebook_branded_content_ads_brand` — branded content partnership ads.
- `facebook_creator_marketplace_discovery` — creator marketplace discovery.

### Business administration

- `business_management` — Business Manager API (asseti, role, business-level administracija).

## Callback i env dogovor (Messenger profil)

Callback URL:

- `https://uslugar-webhooks.onrender.com/webhook/messenger`

Render env (faza 1):

- `META_WEBHOOK_PROFILES=messenger`
- `META_MESSENGER_VERIFY_TOKEN=<isti string kao u Meta Verify Token>`
- `META_MESSENGER_APP_SECRET=<App Secret te Messenger app>`
- `DATABASE_URL=<zajednička baza>`
- `INGEST_API_KEY=<interni ingest ključ>`

Napomena:

- `META_MESSENGER_DATABASE_URL` nije potreban ako svi profili koriste istu bazu (`DATABASE_URL` fallback).

## Admin panel (čitanje profila, poruka, promptova)

- URL na istom servisu: `https://<host>/admin/`
- Zaštita: **`ADMIN_PANEL_TOKEN`** — u pregledniku se šalje kao `Authorization: Bearer <token>`.
- Ako UI hostaš na drugoj domeni (npr. kopija `public/admin/` na Hostinger), na Renderu postavi **`ADMIN_PANEL_ORIGIN=https://…`** da CORS dopusti API pozive.
- HTML je javno dostupan; podaci idu samo preko JSON API-ja uz token.

## Kada uvoditi izostavljene scopeove

- Dodavati samo kad postoji konkretan feature u kodu koji ih koristi.
- Po potrebi odvojiti u posebne Meta aplikacije:
  - Messenger/chat app
  - Page content/moderation app
  - Ads/Business automation app
  - Utility messaging / WhatsApp / Instagram po zasebnoj potrebi

## Operativno pravilo

Manje scopeova = jednostavniji review, manji sigurnosni rizik i lakše održavanje.
