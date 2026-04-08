
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");

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

async function cleanup() {
    console.log("--- CLEANING UP STALE/DUPLICATE ODPS ---");
    const snap = await getDocs(collection(db, "production_orders"));
    
    const seen = new Set();
    const toDelete = [];

    snap.docs.forEach(snapshot => {
        const d = snapshot.data();
        const key = `${d.sku}-${d.odp_number}-${d.status}`;
        
        if (d.status === 'PENDING' && seen.has(key)) {
            console.log(`Deleting duplicate: ${key} [${snapshot.id}]`);
            toDelete.push(snapshot.id);
        } else {
            seen.add(key);
        }

        // Also delete if it's ODP-SYS but we already have a manual DONE ODP for the same product
        // Actually, let's just delete the ones the user specifically mentioned for now.
        if ((d.odp_number === 'ODP-SYS-6065' || d.odp_number === 'ODP-SYS-6066') && d.status === 'PENDING') {
             console.log(`Deleting requested ODP: ${d.odp_number} [${snapshot.id}]`);
             toDelete.push(snapshot.id);
        }
    });

    for (const id of toDelete) {
        await deleteDoc(doc(db, "production_orders", id));
    }
    console.log("Cleanup finished.");
}

cleanup();
