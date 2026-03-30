import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, serverTimestamp } from "firebase/firestore";

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

const units = [
    { id: 'und', name: 'Unidades', short: 'und', category: 'Conteo' },
    { id: 'kg', name: 'Kilogramos', short: 'kg', category: 'Peso' },
    { id: 'gr', name: 'Gramos', short: 'gr', category: 'Peso' },
    { id: 'lt', name: 'Litros', short: 'lt', category: 'Volumen' },
    { id: 'ml', name: 'Mililitros', short: 'ml', category: 'Volumen' },
    { id: 'lb', name: 'Libras', short: 'lb', category: 'Peso' },
    { id: 'paq', name: 'Paquete', short: 'paq', category: 'Conteo' },
    { id: 'cja', name: 'Caja', short: 'cja', category: 'Conteo' },
    { id: 'atd', name: 'Atado', short: 'atd', category: 'Conteo' }
];

async function seed() {
    console.log("🚀 Iniciando carga de Unidades via Web SDK...");
    for (const unit of units) {
        try {
            await setDoc(doc(db, "units", unit.id), {
                name: unit.name,
                short: unit.short,
                category: unit.category,
                updatedAt: serverTimestamp()
            });
            console.log(` ✅ ${unit.id} cargado.`);
        } catch (e) {
            console.error(` ❌ Error cargando ${unit.id}:`, e.message);
        }
    }
    console.log("🏁 Carga finalizada.");
    process.exit(0);
}

seed();
