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
        console.log(`Analyzing ALL items...`);
        prodSnapshot.forEach(d => {
            const p = d.data();
            const stock = (p.initial||0) + (p.purchases||0) - (p.sales||0);
            const safety = Number(p.safety || 0);
            const redZone = safety / 2;
            const type = (p.type || 'none').toLowerCase();
            const category = (p.category || 'none').toLowerCase();
            
            console.log(`[${type.padEnd(8)}|${category.padEnd(20)}] ${p.name.padEnd(30)} | Stock: ${String(stock).padStart(4)} | Safety: ${String(safety).padStart(4)} | RedLimit: ${String(redZone).padStart(4)} | Status: ${stock <= redZone ? 'RED' : (stock <= safety ? 'YELLOW' : 'GREEN')}`);
        });
    } catch(e) {
        console.error(e);
    }
}
run();
