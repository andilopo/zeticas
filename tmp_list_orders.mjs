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

async function listOrders() {
  console.log("--- LISTADO DE PEDIDOS (ZETICAS) ---");
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("No se encontraron pedidos.");
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\n--- DOC: ${doc.id} ---`);
    console.log("Raw Data:", JSON.stringify(data, null, 2));
  });

  process.exit(0);
}

listOrders().catch(err => {
    console.error(err);
    process.exit(1);
});
