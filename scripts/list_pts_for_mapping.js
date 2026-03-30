import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

async function listPTs() {
  const pSnap = await getDocs(collection(db, "products"));
  const pts = pSnap.docs
    .map(d => ({ id: d.id, name: d.data().name, category: d.data().category, sku: d.data().sku || d.id }))
    .filter(p => p.category === 'Producto Terminado');
  
  console.log(JSON.stringify(pts, null, 2));
  process.exit(0);
}

listPTs().catch(console.error);
