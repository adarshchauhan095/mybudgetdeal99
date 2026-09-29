import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  initialProducts,
  initialCollections,
  initialCategories,
  initialDeals,
  initialHomepageSections,
  initialSiteSettings
} from '../src/data/seedData.ts';

const firebaseConfig = {
  apiKey: "AIzaSyCSd6hLGxrJBqPSMVmIvSIq1CMn7DEGm48",
  authDomain: "mybudgetdeal99-f5d2a.firebaseapp.com",
  projectId: "mybudgetdeal99-f5d2a",
  storageBucket: "mybudgetdeal99-f5d2a.firebasestorage.app",
  messagingSenderId: "408950158414",
  appId: "1:408950158414:web:8a580e622b22433aabbf1f",
  measurementId: "G-9SQJLP8DEH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanCollection(name) {
  console.log(`Cleaning existing documents from ${name}...`);
  const colRef = collection(db, name);
  const snap = await getDocs(colRef);
  let deleted = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, name, d.id));
    deleted++;
  }
  console.log(`Deleted ${deleted} items from ${name}.`);
}

async function run() {
  console.log('=== STARTING FIREBASE SEED & SYNC ===');
  
  // 1. Clean old dummy products and data
  await cleanCollection('products');
  await cleanCollection('collections');
  await cleanCollection('categories');
  await cleanCollection('deals');
  await cleanCollection('homepageSections');
  await cleanCollection('settings');

  // 2. Add 16 actual products
  console.log(`Adding ${initialProducts.length} actual affiliate products...`);
  for (const p of initialProducts) {
    await setDoc(doc(db, 'products', p.id), p);
    console.log(`  ✓ Product [${p.id}]: ${p.shortTitle} (ASIN: ${p.asin})`);
  }

  // 3. Add collections
  console.log(`Adding ${initialCollections.length} curated collections...`);
  for (const c of initialCollections) {
    await setDoc(doc(db, 'collections', c.id), c);
    console.log(`  ✓ Collection [${c.id}]: ${c.title}`);
  }

  // 4. Add categories
  console.log(`Adding ${initialCategories.length} categories...`);
  for (const cat of initialCategories) {
    await setDoc(doc(db, 'categories', cat.id), cat);
    console.log(`  ✓ Category [${cat.id}]: ${cat.name}`);
  }

  // 5. Add deals
  console.log(`Adding ${initialDeals.length} active deals...`);
  for (const d of initialDeals) {
    await setDoc(doc(db, 'deals', d.id), d);
    console.log(`  ✓ Deal [${d.id}]: ${d.dealTitle}`);
  }

  // 6. Add homepage sections
  console.log(`Adding ${initialHomepageSections.length} homepage sections...`);
  for (const s of initialHomepageSections) {
    await setDoc(doc(db, 'homepageSections', s.id), s);
    console.log(`  ✓ Section [${s.id}]: ${s.title}`);
  }

  // 7. Add general settings
  console.log('Saving general site settings...');
  await setDoc(doc(db, 'settings', 'general'), initialSiteSettings);
  console.log('  ✓ General site settings saved.');

  console.log('=== ALL PRODUCTS & SETTINGS SUCCESSFULLY SYNCED TO FIREBASE! ===');
  process.exit(0);
}

run().catch(err => {
  console.error('Error during sync:', err);
  process.exit(1);
});
