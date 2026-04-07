import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

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

const idsToDelete = [
    '6IXajzvkI9xQFYq0Ox5t',
    'EWDReXk7ZphIbval8d8m',
    'TAPpNNbTYlPLrlWkqgFm'
];

async function run() {
  for (const id of idsToDelete) {
      console.log(`Deleting ODP: ${id}...`);
      await deleteDoc(doc(db, "production_orders", id));
      console.log(`  -> Deleted.`);
  }
  console.log("Cleanup complete.");
}

run().catch(console.error);
