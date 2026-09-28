# Architecture Documentation — MyBudgetDeal99

## 1. System Overview
**MyBudgetDeal99** is an ultra-fast, mobile-first Amazon Associates affiliate product discovery and curated shopping setup platform. It bridges high-intent shoppers discovering individual budget gear and curated setups directly to Amazon using compliant Special Links.

```
                           +----------------------------------------+
                           |           Shopper Browser              |
                           |  (Mobile First Responsive SPA Shell)   |
                           +-------------------+--------------------+
                                               |
                     +-------------------------+-------------------------+
                     |                                                   |
                     v                                                   v
          +----------------------+                            +----------------------+
          |   Discovery System   |                            |   Setup & Collection |
          |   (Products/Deals)   |                            |   (Interactive Setups|
          +----------+-----------+                            +----------+-----------+
                     |                                                   |
                     +-------------------------+-------------------------+
                                               |
                                               v
                                +------------------------------+
                                |  Catalog Service Layer       |
                                |  - Firestore Client Cache    |
                                |  - Safe Storage Fallback     |
                                |  - Link & ASIN Normalizer    |
                                +--------------+---------------+
                                               |
                      +------------------------+------------------------+
                      |                                                 |
                      v                                                 v
           +--------------------+                            +--------------------+
           |  Firebase Cloud    |                            |  Amazon Associates |
           |  Firestore & Auth  |                            |  Compliant Link    |
           +--------------------+                            +--------------------+
```

---

## 2. Core Architectural Pillars

### A. Dual Discovery Paradigm
1. **System A — Individual Product Discovery:**
   - Dedicated dynamic routes (`/product/:slug`).
   - Categorized by high-utility consumer categories (Electronics & Workspaces, Home & Organization, Automotive & Travel, Daily Lifestyle).
   - Filterable by price range, deals, discount levels, and verified status.

2. **System B — Curated Group / Setup Discovery:**
   - Bundled setups (`/collection/:slug`) like *"Complete Study Table Setup"*, *"Car Essentials"*, *"Work From Home Desk Setup"*.
   - Features dynamic setup checklists where users can explore and tick off accessories required to build a complete workspace or travel kit.

### B. Client-Side Routing on Static Hosting (GitHub Pages)
- Single Page Application (SPA) built using React Router 6.
- Fallback redirection pattern implemented via `public/404.html` and query param encoding in `index.html`.
- Resolves deep dynamic links (`/product/slug`, `/collection/slug`, `/category/slug`) directly on GitHub Pages without HTTP 404s.

### C. Zero-Cost Free-Tier Optimization
- **Dual Persistence:**
  - `catalogService` initializes with Firestore client libraries.
  - When Firestore API is enabled in the Firebase Console, reads and writes flow to cloud collections.
  - When offline or awaiting project activation, `safeStorage` (in-memory + browser storage) serves as an instant resilient fallback with a 1-click **Sync to Firestore** migration utility.
- **Index-Conscious Queries:** Minimizes composite index requirements; performs client-side sorting and filtering for cached collections to eliminate unnecessary billable read operations.

### D. Compliance by Design
- **Editorial vs. Amazon Data Separation:** Editorial notes, buying guides, and setup advice are strictly separated from Amazon-sourced attributes (ASIN, canonical URL, price timestamp).
- **Outbound Link Normalization:** All affiliate buttons utilize `buildAffiliateUrl()` to ensure legitimate tags (`tag=mybudgetdeal99-21&linkCode=as2`), `target="_blank"`, and `rel="nofollow noopener sponsored"`.
