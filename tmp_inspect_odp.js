import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeHMdtEt04RtYarEx_h19gcCUzsIUUpSc",
  authDomain: "delta-core-cloud-45ea0.firebaseapp.com",
  projectId: "delta-core-cloud-45ea0",
  storageBucket: "delta-core-cloud-45ea0.firebasestorage.app",
  messagingSenderId: "378250949856",
  appId: "1:378250949856:web:7a0ce44de64bc9a5becc85"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectOdp() {
    console.log("Checking production_orders...");
    const q = query(collection(db, "production_orders"), orderBy("created_at", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} recent production orders in Firestore.`);
    querySnapshot.forEach((doc) => {
        const d = doc.data();
        console.log(`[${d.created_at}] ODP: ${d.odp_number} | SKU: ${d.sku} | QTY: ${d.qty} | STATUS: ${d.status}`);
    });
}

inspectOdp().catch(console.error);
