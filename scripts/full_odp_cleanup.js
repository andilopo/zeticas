import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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
  console.log("Full scan of production_orders...");
  const querySnapshot = await getDocs(collection(db, "production_orders"));
  
  let deletedCount = 0;
  for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const isFinished = data.status === 'DONE' || !!data.completed_at;
      
      // If it looks like Zetas Griegas OR it's not finished
      if (!isFinished) {
          console.log(`Deleting UNFINISHED ODP: ${docSnap.id}, SKU: ${data.sku}, Status: ${data.status}`);
          await deleteDoc(doc(db, "production_orders", docSnap.id));
          deletedCount++;
      }
  }
  console.log(`Cleanup complete. Total deleted: ${deletedCount}`);
}

run().catch(console.error);
