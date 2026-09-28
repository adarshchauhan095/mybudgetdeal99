# Deployment Guide — GitHub Pages & Production

## 1. Prerequisites
- Remote Repository: `git@github.com:adarshchauhan095/mybudgetdeal99.git`
- GitHub Actions enabled in repository settings.
- Node.js 20+

---

## 2. GitHub Pages Configuration

1. In GitHub, go to your repository: `https://github.com/adarshchauhan095/mybudgetdeal99/settings/pages`.
2. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**.
3. Under **Settings > Secrets and variables > Actions**, add the following repository secrets (or rely on public client Firebase values):
   - `VITE_FIREBASE_API_KEY`: `AIzaSyCSd6hLGxrJBqPSMVmIvSIq1CMn7DEGm48`
   - `VITE_FIREBASE_AUTH_DOMAIN`: `mybudgetdeal99-f5d2a.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID`: `mybudgetdeal99-f5d2a`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `mybudgetdeal99-f5d2a.appspot.com`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `408950158414`
   - `VITE_FIREBASE_APP_ID`: `1:408950158414:web:8a580e622b22433aabbf1f`
   - `VITE_FIREBASE_MEASUREMENT_ID`: `G-9SQJLP8DEH`
   - `VITE_AMAZON_TRACKING_ID`: `mybudgetdeal99-21`

---

## 3. Deployment Workflow

The repository includes a ready-to-run GitHub Actions workflow in `.github/workflows/deploy.yml`:
- Triggered automatically on push to `main` / `master` or manually via **workflow_dispatch**.
- Steps:
  1. Checks out repository.
  2. Runs `npm run test` (Vitest platform suite).
  3. Executes `npm run build` (Vite production bundle with vendor chunking).
  4. Deploys the `./dist` folder to GitHub Pages.

---

## 4. SPA Deep Linking on GitHub Pages

Static hosts normally return an HTTP 404 error when accessing deep URLs like `/product/ergonomic-eye-care-led-desk-lamp` directly.
This project resolves this using:
1. `public/404.html`: Detects the missing route path, encodes it into a query string `/?p=...`, and redirects to `index.html`.
2. `index.html`: Decodes the query parameter and replaces the browser history state before React Router mounts.
This provides seamless client-side routing on GitHub Pages without requiring server-side rendering or dedicated edge redirect rules.

---

## 5. Manual Build Verification

To test the production build locally at any time:
```bash
npm run test
npm run build
npm run preview
```
Open `http://localhost:4173/` to preview the production-optimized build.
