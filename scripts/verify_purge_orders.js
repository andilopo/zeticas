import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkOrders() {
    console.log('--- VERIFICANDO COLECCIÓN: orders ---');
    try {
        const snapshot = await getDocs(collection(db, 'orders'));
        if (snapshot.empty) {
            console.log('✅ La colección "orders" está VACÍA.');
        } else {
            console.log(`❌ La colección "orders" aún tiene ${snapshot.size} documentos.`);
        }
    } catch (error) {
        console.error('Error durante la verificación:', error);
    }
}

checkOrders();
