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

async function listClients() {
  console.log("--- LISTADO DE CLIENTES (ZETICAS) ---");
  const clientsRef = collection(db, "clients");
  const snapshot = await getDocs(clientsRef);
  
  if (snapshot.empty) {
    console.log("No se encontraron clientes.");
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id} | Nombre: ${data.name} | NIT: ${data.nit || 'N/A'}`);
  });

  process.exit(0);
}

listClients().catch(err => {
    console.error(err);
    process.exit(1);
});
