
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

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

async function inspect() {
    console.log("--- INSPECTING DIP ALCACHOFAS ---");
    const itemSnap = await getDocs(collection(db, "items"));
    const alcachofa = itemSnap.docs.find(doc => doc.data().name.includes("Alcachofa"));
    
    if (alcachofa) {
        const d = alcachofa.data();
        console.log(`Product: ${d.name} | Initial: ${d.initial} | Sales: ${d.sales} | Purchases: ${d.purchases}`);
        console.log(`Safety Stock: ${d.min_stock_level || d.safety || d.reorder_point || 0}`);
        
        // Check recipes
        const recipeSnap = await getDocs(collection(db, "recipes"));
        const recipe = recipeSnap.docs.find(doc => doc.data().product === d.name);
        if (recipe) {
            console.log(`Recipe found: ${recipe.id}`);
        } else {
            console.log("No recipe found for this product.");
        }
    } else {
        console.log("Product 'Dip Alcachofas' not found.");
    }
}

inspect();
