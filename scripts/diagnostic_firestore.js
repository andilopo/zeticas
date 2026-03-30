import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

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

async function inspect() {
  console.log("--- Inspecting Products (Ruibarbo) ---");
  const pSnap = await getDocs(collection(db, "products"));
  const products = pSnap.docs.map(d => ({ id: d.id, name: d.data().name, category: d.data().category }));
  
  const mermeladas = products.filter(p => p.name.includes("Ruibarbo"));
  console.log("Filtered Products (Ruibarbo):", mermeladas);

  console.log("\n--- Checking Recipes for these IDs ---");
  for (const m of mermeladas) {
      const q = query(collection(db, "recipes"), where("finished_good_id", "==", m.id));
      const res = await getDocs(q);
      console.log(`Product "${m.name}" (ID: ${m.id}) has ${res.size} recipe lines.`);
  }

  process.exit(0);
}

inspect().catch(console.error);
