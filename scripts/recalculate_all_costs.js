import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

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

const siFactors = {
    'kg_gr': 1000, 'gr_kg': 0.001,
    'lt_ml': 1000, 'ml_lt': 0.001,
    'lb_gr': 453.59, 'gr_lb': 1/453.59,
    'lb_kg': 0.45359, 'kg_lb': 2.20462
};

function convertUnit(value, from, to) {
    if (!value || from === to) return Number(value);
    const key = `${from}_${to}`;
    if (siFactors[key]) return Number(value) * siFactors[key];
    return Number(value);
}

async function recalculate() {
  console.log("Starting full cost recalculation...");
  const itemsSnap = await getDocs(collection(db, 'products'));
  const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const recipesSnap = await getDocs(collection(db, 'recipes'));
  const groupedRecipes = {};
  recipesSnap.docs.forEach(doc => {
      const r = doc.data();
      if (!groupedRecipes[r.finished_good_id]) groupedRecipes[r.finished_good_id] = [];
      groupedRecipes[r.finished_good_id].push(r);
  });

  const pts = items.filter(i => i.category === 'Producto Terminado');
  const materials = items.filter(i => i.category === 'Materia Prima');

  for (const pt of pts) {
      const ptRecipe = groupedRecipes[pt.id] || [];
      if (ptRecipe.length === 0) continue;

      let totalCost = 0;
      for (const ingredient of ptRecipe) {
          const material = materials.find(m => m.id === ingredient.raw_material_id);
          if (material) {
              const materialCost = Number(material.price) || 0;
              const convertedQty = convertUnit(ingredient.quantity_required, ingredient.unit, material.unit);
              totalCost += convertedQty * materialCost;
          }
      }

      if (totalCost > 0) {
          await updateDoc(doc(db, 'products', pt.id), {
              recipe_cost: totalCost,
              automated_cost: totalCost,
              last_cost_recalc: new Date().toISOString()
          });
          console.log(`Updated ${pt.name}: ${totalCost}`);
      }
  }
  console.log("Recalculation complete.");
  process.exit(0);
}

recalculate().catch(console.error);
