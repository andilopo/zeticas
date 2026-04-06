import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
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

const mapping = [
  { name: 'Alcachofa', image: '/products/alcachofa_sin.png' },
  { name: 'Antipasto', image: '/products/antipasto_sin.png' },
  { name: 'Garbanzo', image: '/products/garbanzo_sin.png' },
  { name: 'Guayaba', image: '/products/guayaba_sin.png' },
  { name: 'Haba', image: '/products/habas_sin.png' },
  { name: 'Habas', image: '/products/habas_sin.png' },
  { name: 'Papayuela', image: '/products/papayuela_sin.png' },
  { name: 'Pera', image: '/products/pera_sin.png' },
  { name: 'Pesto', image: '/products/pesto_sin.png' },
  { name: 'Pimentón', image: '/products/pimenton_sin.png' },
  { name: 'Ruibarbo Fresa', image: '/products/ruibarbo_fresa_sin.png' },
  { name: 'Zetas Griegas', image: '/products/zetas_griegas_sin.png' }
];

async function updateProductImages() {
  console.log("📸 Actualizando imágenes de productos en Firestore...");

  try {
    const snapshot = await getDocs(collection(db, 'products'));
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const item of mapping) {
      const target = products.find(p => 
        (p.name || '').toLowerCase().includes(item.name.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(item.name.toLowerCase())
      );

      if (target) {
        console.log(`✅ Vinculando ${item.name} -> ${item.image}`);
        await updateDoc(doc(db, 'products', target.id), { image: item.image });
      } else {
        console.log(`⚠️ No se encontró producto para: ${item.name}`);
      }
    }
    console.log("✨ Actualización completa.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
  process.exit(0);
}

updateProductImages().catch(console.error);
