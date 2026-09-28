# Firebase Configuration & Deployment Guide

## 1. Firebase Project Setup

### Existing Project Details
- **Project ID**: `mybudgetdeal99-f5d2a`
- **Project Number**: `408950158414`
- **Web App ID**: `1:408950158414:web:8a580e622b22433aabbf1f`
- **Auth Domain**: `mybudgetdeal99-f5d2a.firebaseapp.com`
- **Google Analytics ID**: `G-9SQJLP8DEH`

---

## 2. Enabling Cloud Firestore in the Firebase Console

To activate Firestore for persistent cloud data:
1. Open the [Firebase Console](https://console.firebase.google.com/project/mybudgetdeal99-f5d2a/firestore).
2. Click **Create database**.
3. Choose your database location (e.g. `asia-south1` for Mumbai / India, or `us-central1`).
4. Select **Start in production mode** (our security rules will protect your collections).
5. Click **Done**.

Once created, log into the Admin portal at `/admin` and click **"Sync All to Firestore"** on the dashboard to push all pre-configured seed catalog data to your live database.

---

## 3. Firestore Security Rules (`firestore.rules`)

The security rules enforce role-based access control (RBAC):
- **Public Read Access**: Products, categories, collections, active deals, banners, and homepage sections are publicly readable.
- **Admin Only Writes**: Only authenticated administrators with the admin role or verified admin email can create, update, or delete products and settings.
- **Client Analytics**: Anonymous users may create internal event documents (`analytics`) without read or update access.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        request.auth.token.admin == true ||
        request.auth.token.email in ['admin@mybudgetdeal99.com']
      );
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    // ... complete rules in firestore.rules
  }
}
```

Deploy the rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Firestore Indexes (`firestore.indexes.json`)

Pre-defined composite indexes for queries involving status, categories, and priority:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "isFeatured", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy the indexes:
```bash
firebase deploy --only firestore:indexes
```
