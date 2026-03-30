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
    { from: "Mermelada Ruibarbo Fresa", to: "Mermelada Ruibarbo & Fresa" },
    { from: "Papayuela + limonaria", to: "Dulce Papayuela y Limonaria" },
    { from: "Antipasto tuna", to: "Antipasto Atún Ahumado" },
    { from: "Vinagreta", to: "Vinagreta Migalaba" },
    { from: "Antipasto Veggie", to: "Antipasto Vegetales Ahumados" },
    { from: "Berenjena Toscana", to: "Berenjenas para untar" },
    { from: "Guava + Albahaca", to: "Mermelada Guayaba & Albahaca" }
];

async function runMigration() {
    console.log("🚀 Iniciando migración de recetas...");
    
    // 1. Obtener todos los productos para mapear IDs
    const pSnap = await getDocs(collection(db, "products"));
    const products = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const pair of mapping) {
        const fromProd = products.find(p => p.name === pair.from);
        const toProd = products.find(p => p.name === pair.to);

        if (fromProd && toProd) {
            console.log(`\n🔄 Migrando de "${fromProd.name}" (${fromProd.id}) a "${toProd.name}" (${toProd.id})...`);
            
            // Buscar recetas del "From"
            const q = query(collection(db, "recipes"), where("finished_good_id", "==", fromProd.id));
            const rSnap = await getDocs(q);
            
            console.log(`  - Se encontraron ${rSnap.size} líneas de receta para mover.`);
            
            for (const rDoc of rSnap.docs) {
                await updateDoc(doc(db, "recipes", rDoc.id), {
                    finished_good_id: toProd.id,
                    finished_good_name: toProd.name
                });
            }

            // Borrar el producto duplicado
            console.log(`  - Borrando producto duplicado "${fromProd.name}"...`);
            await deleteDoc(doc(db, "products", fromProd.id));
            console.log(`  - Hecho.`);
        } else {
            if (!fromProd) console.log(`  ⚠️ No se encontró el origen "${pair.from}"`);
            if (!toProd) console.log(`  ⚠️ No se encontró el destino "${pair.to}"`);
        }
    }

    console.log("\n🏁 Migración de datos finalizada.");
    process.exit(0);
}

runMigration().catch(console.error);
