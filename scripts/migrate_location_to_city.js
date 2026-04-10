import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteField } from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAeHMdtEt04RtYarEx_h19gcCUzsIUUpSc",
  authDomain: "delta-core-cloud-45ea0.firebaseapp.com",
  projectId: "delta-core-cloud-45ea0",
  storageBucket: "delta-core-cloud-45ea0.firebasestorage.app",
  messagingSenderId: "378250949856",
  appId: "1:378250949856:web:7a0ce44de64bc9a5becc85"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log("🚀 Iniciando saneamiento de datos (location -> city)...");
  
  const clientsCol = collection(db, 'clients');
  const snapshot = await getDocs(clientsCol);
  
  let count = 0;
  for (const clientDoc of snapshot.docs) {
    const data = clientDoc.data();
    
    // Case 1: Only location exists
    if (data.location && !data.city) {
      console.log(`📌 Migrando cliente: ${data.name || clientDoc.id}`);
      await updateDoc(doc(db, 'clients', clientDoc.id), {
        city: data.location,
        location: deleteField()
      });
      count++;
    } 
    // Case 2: Both exist (redundancy)
    else if (data.location && data.city) {
      console.log(`🧹 Limpiando columna duplicada para: ${data.name || clientDoc.id}`);
      await updateDoc(doc(db, 'clients', clientDoc.id), {
        location: deleteField()
      });
      count++;
    }
  }
  
  console.log(`✅ Saneamiento completado. ${count} registros corregidos.`);
}

migrate().catch(console.error);
