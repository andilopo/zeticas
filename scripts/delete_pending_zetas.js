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
  const q = query(collection(db, "production_orders"), where("sku", "==", "Zetas Griegas"));
  const querySnapshot = await getDocs(q);
  
  for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.status === 'PENDING' || !data.completed_at) {
          console.log(`Deleting PENDING Zetas Griegas ODP: ${docSnap.id}...`);
          await deleteDoc(doc(db, "production_orders", docSnap.id));
      }
  }
  console.log("Cleanup complete.");
}

run().catch(console.error);
