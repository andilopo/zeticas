import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, orderBy, query, limit } from "firebase/firestore";

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
    console.log("Checking last 5 orders in Firestore...");
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(5));
    const snap = await getDocs(q);
    
    if (snap.empty) {
        console.log("No orders found in collection 'orders'.");
    } else {
        snap.forEach(doc => {
            const data = doc.data();
            console.log(`- Order: ${data.id || data.order_number} | Client: ${data.client} | Date: ${data.date} | Status: ${data.status} | Source: ${data.source}`);
        });
    }
    process.exit(0);
}

checkOrders().catch(err => {
    console.error("Error checking orders:", err);
    process.exit(1);
});
