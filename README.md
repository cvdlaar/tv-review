# TV Slides — Logistiekconcurrent

Interne TV-schermen voor het tonen van klantreviews op Yodeck-schermen.

## Installatie

### Vereisten
- Node.js 20+
- Docker Desktop (voor PostgreSQL)

### Stap 1: Repository klonen en dependencies installeren

```bash
npm install
```

### Stap 2: Omgevingsvariabelen instellen

```bash
cp .env.example .env
```

Pas het `.env` bestand aan als je een andere JWT_SECRET wilt gebruiken.

### Stap 3: Database starten

```bash
docker compose up -d
```

Wacht tot de database gezond is (±5 seconden).

### Stap 4: Database migraties draaien

```bash
npm run db:generate
npm run db:migrate
```

Geef de migratie een naam, bijv: `init`

### Stap 5: Seed data laden

```bash
npm run db:seed
```

Dit laadt:
- Admin- en viewergebruiker
- Logistiekconcurrent.nl en Logistiekdirect.be als merken
- Reviewbronnen (mock)
- Shopreviews (positief en verbeterpunten)
- Productreviews met producten
- 4 slide templates
- 3 TV-schermen

### Stap 6: Development starten

```bash
npm run dev
```

- **Admin:** http://localhost:5173/admin
- **Server:** http://localhost:3001
- **Health check:** http://localhost:3001/health

---

## Development login

| Rol    | E-mail                                | Wachtwoord    |
|--------|---------------------------------------|---------------|
| Admin  | admin@logistiekconcurrent.nl          | Admin2024!    |
| Viewer | viewer@logistiekconcurrent.nl         | Viewer2024!   |

---

## TV-schermen (Yodeck URLs)

Na seeding zijn de schermen beschikbaar via:

| Scherm                        | URL                                                                 |
|-------------------------------|---------------------------------------------------------------------|
| LC Shopreviews                | http://localhost:5173/screens/logistiekconcurrent-reviews?key=lc-screen-key-2024 |
| LD Shopreviews                | http://localhost:5173/screens/logistiekdirect-reviews?key=ld-screen-key-2024 |
| Productreviews                | http://localhost:5173/screens/productreviews?key=product-screen-key-2024 |

In de admin vind je de echte screen keys en kun je de URL kopiëren voor gebruik in Yodeck.

### Screen key systeem

- Elke screen heeft een unieke `screenKey`
- De key zit als query parameter in de Yodeck URL: `?key=...`
- Beheerders kunnen de key vernieuwen via de admin → TV-schermen
- Bij ongeldige key toont het scherm een nette fallbackpagina (geen technische details)

---

## Admin routes

| Route                          | Beschrijving                    |
|-------------------------------|---------------------------------|
| `/login`                      | Inlogpagina                     |
| `/admin`                      | Dashboard                       |
| `/admin/screens`              | TV-schermen beheren             |
| `/admin/templates`            | Slide-templates                 |
| `/admin/brands`               | Merken                          |
| `/admin/review-sources`       | Reviewbronnen & sync            |
| `/admin/sync-logs`            | Synchronisatielogboek           |

---

## Hoe templates werken

Elk TV-scherm heeft een `SlideTemplate` die bepaalt hoe de slide eruitziet.

De template heeft:
- `type`: bepaalt welk pre-gebouwd slide-component gebruikt wordt
- `backgroundConfig`: JSON met achtergrondconfiguratie
- `elements`: JSON-array met elementen (tekstblokken, reviews, logo's etc.)

Huidige template-types:
| Type                  | Beschrijving                             |
|-----------------------|------------------------------------------|
| `positive_review`     | Blauwe achtergrond, positieve review     |
| `improvement_review`  | Split blauw/grijs, verbeterpunt          |
| `split_review`        | Twee reviews naast elkaar                |
| `product_review`      | Productfoto + review                     |

---

## Echte review API's toevoegen (fase 2)

Maak een nieuw bestand: `server/src/providers/kiyohProvider.ts`

Implementeer de `ReviewProvider` interface uit `server/src/providers/types.ts`:

```typescript
import { ReviewProvider } from './types';

export const kiyohProvider: ReviewProvider = {
  async fetchShopReviews({ source }) {
    // Haal reviews op via Kiyoh API
    // source.apiUrl bevat de API endpoint
    // source.apiKeyReference bevat de naam van de environment variable met de API key
    const apiKey = process.env[source.apiKeyReference ?? ''];
    // ...
    return reviews;
  },
  async fetchProductReviews({ source }) {
    // ...
    return reviews;
  },
};
```

Registreer de provider in `server/src/providers/providerFactory.ts`:

```typescript
import { kiyohProvider } from './kiyohProvider';

const providers = {
  mock: mockReviewProvider,
  kiyoh: kiyohProvider,  // ← toevoegen
};
```

Stel in de admin de `providerName` van een ReviewSource in op `'kiyoh'`.

---

## Channable feed import (fase 2)

Voeg een import service toe in `server/src/services/productFeedImportService.ts`.

Ondersteunde formaten: JSON, CSV.

Verplichte velden: `sku`, `name`, `imageUrl`.
Optionele velden: `url`, `price`.

SKU-normalisatie (al aanwezig in `skuNormalizer.ts`): trim → uppercase → string.

---

## Fase 2 roadmap

- [ ] Channable feed import (JSON/CSV)
- [ ] Echte review API-adapters (Kiyoh, Trustpilot, etc.)
- [ ] Handmatige sync-knop per bron
- [ ] Productreview SKU-matching logs

## Fase 3 roadmap

- [ ] Drag-and-drop template editor (react-rnd)
- [ ] Elementen verslepen en resizen op 1920×1080 canvas
- [ ] Upload van achtergrondafbeeldingen en logo's
- [ ] Template preview-modus
- [ ] Templates dupliceren en aanpassen
