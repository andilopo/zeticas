import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

async function testWrite() {
    console.log("Testing write to 'collection_antigravity_test'...");
    try {
        const docRef = await addDoc(collection(db, "collection_antigravity_test"), {
            timestamp: new Date().toISOString(),
            message: "Hello user, can you see this collection now?"
        });
        console.log(` ✅ Written with ID: ${docRef.id}`);
    } catch (e) {
        console.error(" ❌ Error:", e.message);
    }
    process.exit(0);
}

testWrite();
