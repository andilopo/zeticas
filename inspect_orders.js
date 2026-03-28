
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAeHMdtEt04RtYarEx_h19gcCUzsIUUpSc",
    authDomain: "delta-core-cloud-45ea0.firebaseapp.com",
    projectId: "delta-core-cloud-45ea0",
    storageBucket: "delta-core-cloud-45ea0.firebasestorage.app",
    messagingSenderId: "378250949856",
    appId: "1:378250949856:web:7a0ce44de64bc9a5becc85",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLastOrders() {
    try {
        const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(d => {
            console.log("Order ID:", d.id);
            console.log("Data:", JSON.stringify(d.data(), null, 2));
            console.log("-------------------");
        });
    } catch (err) {
        console.error(err);
    }
}

checkLastOrders().then(() => process.exit());
