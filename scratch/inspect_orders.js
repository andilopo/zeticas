import { db } from './src/firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';

async function inspect() {
    console.log("--- INSPECCIÓN DE ESTADOS DE PEDIDOS ---");
    const snapshot = await getDocs(collection(db, 'orders'));
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${data.id} | OrderNum: ${data.order_number} | Status: "${data.status}"`);
    });
    process.exit(0);
}

inspect();
