import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeHMdtEt04RtYarEx_h19gcCUzsIUUpSc",
  authDomain: "delta-core-cloud-45ea0.firebaseapp.com",
  projectId: "delta-core-cloud-45ea0",
  storageBucket: "delta-core-cloud-45ea0.firebasestorage.app",
  messagingSenderId: "378250949856",
  appId: "1:378250949856:web:7a0ce44de64bc9a5becc85",
  measurementId: "G-Q1BXE4WVZP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const colsToCheck = [
    'banks', 'banksx', 'clients', 'leads', 'leadsx', 'orders', 'products', 'productsx', 
    'purchase_orders', 'purchasesx', 'recipes', 'site_content', 'suppliers', 'users', 'usersx', 'units'
];

async function checkCounts() {
    console.log("Count Check for all collections...");
    for (const c of colsToCheck) {
        try {
            const snap = await getDocs(collection(db, c));
            console.log(` - ${c}: ${snap.size} documents`);
        } catch (e) {
            console.log(` - ${c}: ERROR (${e.message})`);
        }
    }
    process.exit(0);
}

checkCounts();
