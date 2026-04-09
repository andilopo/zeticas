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

async function checkPurchaseOrders() {
    console.log('--- VERIFICANDO COLECCIÓN: purchase_orders ---');
    try {
        const snapshot = await getDocs(collection(db, 'purchase_orders'));
        if (snapshot.empty) {
            console.log('✅ La colección "purchase_orders" está VACÍA.');
        } else {
            console.log(`❌ La colección "purchase_orders" aún tiene ${snapshot.size} documentos.`);
        }
    } catch (error) {
        console.error('Error durante la verificación:', error);
    }
}

checkPurchaseOrders();
