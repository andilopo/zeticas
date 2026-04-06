import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config();

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

async function deepClean() {
  console.log("🧹 Iniciando limpieza profunda de datos de prueba...");

  const collections = [
    'orders', 
    'production_orders', 
    'purchase_orders', 
    'bank_transactions', 
    'expenses'
  ];

  for (const colName of collections) {
    try {
      console.log(`Buscando registros en '${colName}'...`);
      const snapshot = await getDocs(collection(db, colName));
      
      if (snapshot.empty) {
        console.log(`  - La colección '${colName}' ya está vacía.`);
        continue;
      }

      console.log(`  - Eliminando ${snapshot.size} documentos...`);
      const promises = snapshot.docs.map(d => deleteDoc(doc(db, colName, d.id)));
      await Promise.all(promises);
      console.log(`✅ Colección '${colName}' limpia.`);
    } catch (err) {
      console.error(`❌ Error al limpiar '${colName}':`, err.message);
    }
  }

  console.log("\n✨ ¡Limpieza completada! El sistema está listo para datos reales.");
  process.exit(0);
}

deepClean().catch(err => {
  console.error(err);
  process.exit(1);
});
