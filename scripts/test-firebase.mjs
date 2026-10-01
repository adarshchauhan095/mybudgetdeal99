import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

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

async function test() {
  console.log("Testing Firestore connection to mybudgetdeal99-f5d2a...");
  try {
    const q = query(collection(db, "products"), limit(5));
    const snap = await getDocs(q);
    console.log(`Success! Found ${snap.docs.length} products.`);
    snap.docs.forEach(d => console.log(` - [${d.id}]:`, d.data().title || d.data().name));
  } catch (err) {
    console.error("Firestore error:", err.code, err.message);
  }
  process.exit(0);
}

test();
