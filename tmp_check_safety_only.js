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
        console.log(`Analyzing Safety Stock for products...`);
        prodSnapshot.forEach(d => {
            const p = d.data();
            const safety = Number(p.safety || 0);
            if (safety > 0) {
              const stock = (p.initial||0) + (p.purchases||0) - (p.sales||0);
              console.log(`${p.name.padEnd(30)} | Stock: ${stock} | Safety: ${safety}`);
            }
        });
    } catch(e) { console.error(e); }
}
run();
