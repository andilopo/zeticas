
import { db } from './src/lib/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function check() {
    console.log("Checking Bold Mode in Firestore...");
    const q = query(collection(db, 'site_content'), where('section', '==', 'web_shipping'), where('key', '==', 'bold_mode'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        console.log("No bold_mode configuration found.");
    } else {
        snapshot.forEach(doc => {
            console.log("Found:", doc.data());
        });
    }
}
check();
