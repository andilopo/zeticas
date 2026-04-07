import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

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

async function run() {
  console.log("Inspecting Firestore production_orders...");
  const q = query(collection(db, "production_orders"));
  const querySnapshot = await getDocs(q);
  
  console.log(`Found ${querySnapshot.size} production orders in total.`);
  
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const isCompleted = !!data.completed_at || data.status === 'DONE';
    console.log(`DOC ID: ${docSnap.id}, SKU: ${data.sku}, Number: ${data.odp_number}, Status: ${data.status}, Completed: ${!!data.completed_at}, Finished: ${isCompleted}`);
    
    // Check for "Zetas Griegas" specifically or null SKUs
    if (data.sku === 'Zetas Griegas' && !isCompleted) {
        console.log("  -> ACTIVE ZETAS GRIEGAS FOUND");
    }
    if (!data.sku && !isCompleted) {
        console.log("  -> ACTIVE NULL SKU FOUND");
    }
  });
}

run().catch(console.error);
