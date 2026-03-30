import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";

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

const mapping = [
    { from: "Guava + Albahaca", to: "Dulce Guayaba y Albahaca" }
];

async function runMigration() {
    console.log("🚀 Iniciando migración de recetas (Paso 2)...");
    
    const pSnap = await getDocs(collection(db, "products"));
    const products = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const pair of mapping) {
        const fromProd = products.find(p => p.name === pair.from);
        const toProd = products.find(p => p.name === pair.to);

        if (fromProd && toProd) {
            console.log(`\n🔄 Migrando de "${fromProd.name}" (${fromProd.id}) a "${toProd.name}" (${toProd.id})...`);
            
            const q = query(collection(db, "recipes"), where("finished_good_id", "==", fromProd.id));
            const rSnap = await getDocs(q);
            
            for (const rDoc of rSnap.docs) {
                await updateDoc(doc(db, "recipes", rDoc.id), {
                    finished_good_id: toProd.id,
                    finished_good_name: toProd.name
                });
            }

            console.log(`  - Borrando producto duplicado "${fromProd.name}"...`);
            await deleteDoc(doc(db, "products", fromProd.id));
        }
    }

    console.log("\n🏁 Paso 2 finalizado.");
    process.exit(0);
}

runMigration().catch(console.error);
