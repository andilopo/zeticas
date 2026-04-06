import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";

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

async function inspectCollections() {
  console.log("--- INSPECCIONANDO ORDERS ---");
  const ordersSnap = await getDocs(collection(db, "orders"));
  ordersSnap.forEach(doc => {
      const d = doc.data();
      console.log(`- Order: ${d.order_number || doc.id} | Status: ${d.status}`);
  });

  console.log("\n--- INSPECCIONANDO PURCHASE_ORDERS ---");
  const poSnap = await getDocs(collection(db, "purchase_orders"));
  poSnap.forEach(doc => {
      const d = doc.data();
      console.log(`- PO ID Doc: ${doc.id}`);
      console.log(`  PO Number (po_number): ${d.po_number || 'N/A'}`);
      console.log(`  PO ID Field (id): ${d.id || 'N/A'}`);
      console.log(`  Status: ${d.status}`);
  });

  process.exit(0);
}

inspectCollections().catch(console.error);
