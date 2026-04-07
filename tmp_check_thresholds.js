import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkThresholds() {
    console.log("Analyzing product thresholds and ODP triggers...");
    const itemsSnap = await getDocs(collection(db, "products"));
    const recipesSnap = await getDocs(collection(db, "recipes"));
    const odpSnap = await getDocs(collection(db, "production_orders"));

    const items = itemsSnap.docs.map(d => ({id: d.id, ...d.data()}));
    const productionOrders = odpSnap.docs.map(d => ({id: d.id, ...d.data()}));
    
    // Recipes organized by finished_good_id or name
    const recipeDict = {};
    recipesSnap.docs.forEach(d => {
        const r = d.data();
        const key = r.finished_good_id || r.name;
        if(!recipeDict[key]) recipeDict[key] = true;
    });

    const activeProductionSKUs = productionOrders
        .filter(po => po.status !== 'DONE' && !po.completed_at)
        .map(po => (po.sku || '').toLowerCase().trim());

    items.forEach(p => {
        const currentStock = (p.initial || 0) + (p.purchases || 0) - (p.sales || 0);
        const safetyStock = Number(p.safety) || 0;
        const redZoneLimit = safetyStock / 2;
        const hasRecipe = recipeDict[p.id] || recipeDict[p.name];

        if (p.type === 'product' || (p.category && p.category.includes('Producto'))) {
            if (currentStock <= safetyStock) {
                const inRedZone = currentStock <= redZoneLimit;
                const producing = activeProductionSKUs.includes((p.name || '').toLowerCase().trim());
                
                console.log(`${p.name}: Stock ${currentStock} | Safety ${safetyStock} | RedLimit ${redZoneLimit} | Red? ${inRedZone} | Recipe? ${hasRecipe} | ActiveODP? ${producing}`);
            }
        }
    });
}

checkThresholds().catch(console.error);
