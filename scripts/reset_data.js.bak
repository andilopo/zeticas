import { db } from '../src/lib/firebase.js';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

async function clearCollections() {
    // La colección REAL es 'purchase_orders', no 'purchases'
    const collectionsToClear = ['purchase_orders', 'orders', 'expenses'];
    console.log('--- STARTING ATOMIC RESET ---');
    
    for (const collName of collectionsToClear) {
        console.log(`Cleaning collection: ${collName}...`);
        try {
            const snapshot = await getDocs(collection(db, collName));
            if (snapshot.empty) {
                console.log(`- ${collName} was already empty.`);
                continue;
            }
            const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id)));
            await Promise.all(deletePromises);
            console.log(`- ${collName}: ${snapshot.size} records deleted.`);
        } catch (e) {
            console.error(`Error in collection ${collName}:`, e);
        }
    }
    console.log('--- SYSTEM RESET COMPLETE (ATOMIC) ---');
    process.exit(0);
}

clearCollections();
