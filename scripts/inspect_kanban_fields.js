import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query, where } from "firebase/firestore";

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

async function inspect() {
  console.log("--- Investigando campos de la colección 'orders' ---");
  
  // 1. Tomar una muestra general para ver todos los campos posibles
  const generalSnap = await getDocs(query(collection(db, "orders"), limit(5)));
  const allFields = new Set();
  generalSnap.forEach(doc => {
    Object.keys(doc.data()).forEach(key => allFields.add(key));
  });
  console.log("Campos encontrados en muestra general:", Array.from(allFields));

  // 2. Buscar pedidos que ya estén marcados como hidden
  console.log("\n--- Buscando pedidos con kanban_hidden: true ---");
  const hiddenSnap = await getDocs(query(collection(db, "orders"), where("kanban_hidden", "==", true), limit(3)));
  
  if (hiddenSnap.empty) {
    console.log("No se encontraron pedidos con kanban_hidden: true.");
  } else {
    hiddenSnap.forEach(doc => {
      console.log(`\nPedido ID: ${doc.id}`);
      console.log("Datos relevantes:", {
        status: doc.data().status,
        kanban_hidden: doc.data().kanban_hidden,
        kanban_archived_at: doc.data().kanban_archived_at || "NO EXISTE",
        created_at: doc.data().created_at,
        last_status_at: doc.data().last_status_at || "NO EXISTE"
      });
    });
  }

  process.exit(0);
}

inspect().catch(console.error);
