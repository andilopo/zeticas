import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit } from "firebase/firestore";

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

async function check() {
  console.log("Checking orders collection...");
  const snap = await getDocs(collection(db, "orders"));
  console.log(`Found ${snap.size} documents in 'orders'.`);
  if (snap.size > 0) {
    console.log("Fields in first doc:", Object.keys(snap.docs[0].data()));
    console.log("Sample:", snap.docs[0].data());
  }
  process.exit(0);
}

check().catch(console.error);
