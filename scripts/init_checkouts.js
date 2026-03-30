import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

async function initCheckouts() {
    console.log("Forcing initialization of 'web_checkouts' collection...");
    try {
        const docRef = await addDoc(collection(db, 'web_checkouts'), {
            status: 'pending',
            test: true,
            created_at: new Date().toISOString(),
            info: "Documento de inicialización del sistema"
        });
        console.log("SUCCESS: Collection created. First doc ID:", docRef.id);
        console.log("You should now see 'web_checkouts' in your Firestore console.");
    } catch (err) {
        console.error("Error initializing collection:", err);
    }
    process.exit(0);
}

initCheckouts();
