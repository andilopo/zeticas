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

async function findSimilar() {
  const pSnap = await getDocs(collection(db, "products"));
  const products = pSnap.docs.map(d => ({ name: d.data().name, id: d.id, category: d.data().category }));

  console.log("Searching for Veggie/Vegetales similar names:");
  console.log(products.filter(p => p.name.includes("Antipasto") || p.name.includes("Vegetales")));

  console.log("\nSearching for Guava/Guayaba similar names:");
  console.log(products.filter(p => p.name.includes("Guava") || p.name.includes("Guayaba") || p.name.includes("Albahaca")));

  process.exit(0);
}

findSimilar().catch(console.error);
