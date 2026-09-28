# Admin Guide & Catalog Operations

## 1. Accessing the Admin Portal
- Navigate to `/admin` or `/admin/login`.
- **Default Development Access**: Click **"Instant Development Access"** to immediately sign into the admin portal during testing.
- **Firebase Authentication**: You can create an admin user in Firebase Authentication with email `admin@mybudgetdeal99.com` and password `AdminDeal99!`.

---

## 2. Smart Product Import Workflow (Under 30 Seconds)

1. Open `/admin/products/new`.
2. **Paste Amazon URL**:
   - Accepts Amazon India (`amazon.in`) and Global (`amazon.com`) product URLs (standard, short `amzn.to`, or mobile share links).
   - Example: `https://www.amazon.in/dp/B08N5WRWNW`
3. Click **"Analyze & Extract"**:
   - The engine automatically isolates the 10-character ASIN.
   - Cleans tracking parameters.
   - Runs duplicate detection against the existing catalog.
   - Pre-populates the canonical Amazon URL and generated Special Link.
4. Fill in product details:
   - **Product Title**: Clean, clear commercial title.
   - **Editorial Highlights**: Bullet points explaining why this budget item is worth purchasing.
   - **Category & Collections**: Select primary category and one or more curated setups.
   - **Pricing**: Enter current price and previous price.
5. Review the **Publish Checklist**:
   - Verifies ASIN presence.
   - Verifies canonical Amazon link format.
   - Checks image URL and category assignment.
6. Click **"Save Product"**.

---

## 3. Curated Setup & Collection Builder

1. Navigate to `/admin/collections`.
2. Click **"New Collection"**.
3. Provide:
   - **Name**: e.g., *"Work From Home Setup"*.
   - **Slug**: e.g., `work-from-home-setup` (used in URL `/collection/work-from-home-setup`).
   - **Setup Checklist**: List required components (e.g., *"Ergonomic Chair, Laptop Stand, Cable Sleeve"*).
   - **Editorial Tips**: Practical advice on how to assemble and optimize the setup.
4. Assign products to the collection either directly or by editing individual products and checking the collection tag.

---

## 4. Homepage Section Builder

Control the homepage sections dynamically without redeploying code:
- Go to `/admin/homepage`.
- Enable/disable sections (Hero Banners, Featured Deals, Curated Setups, Trending Gadgets, Categories, Trust & Security).
- Adjust display priorities, titles, subtitles, and max product counts.

---

## 5. Audit Logs & System Health

- **System Health (`/admin/health`)**: Analyzes catalog for missing images, missing ASINs, unverified links, and unassigned collections.
- **Audit Logs (`/admin/audit-logs`)**: Complete event trail recording all product creations, price updates, deletions, and configuration changes with timestamps and user identifiers.
