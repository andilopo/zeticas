import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function run() {
    try {
        const prodSnapshot = await getDocs(collection(db, "products"));
        console.log(`Analyzing Fields for ODP triggers...`);
        prodSnapshot.forEach(d => {
            const p = d.data();
            const safety = Number(p.safety || 0);
            const minStock = Number(p.min_stock_level || 0);
            const reorder = Number(p.reorder_point || 0);
            if (safety > 0 || minStock > 0 || reorder > 0) {
              const stock = (p.initial||0) + (p.purchases||0) - (p.sales||0);
              console.log(`${p.name.padEnd(30)} | Stock: ${stock} | Safety: ${safety} | Min: ${minStock} | Reorder: ${reorder}`);
            }
        });
    } catch(e) { console.error(e); }
}
run();
