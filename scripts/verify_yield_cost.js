import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

async function verifyYieldCost() {
  console.log("Verifying yield-normalized costs...");
  const pSnap = await getDocs(query(collection(db, "products"), where("name", "==", "Mermelada Ruibarbo & Fresa")));
  if (!pSnap.empty) {
    const pt = pSnap.docs[0].data();
    console.log(`Product: ${pt.name}`);
    console.log(`Yield: ${pt.recipe_yield}`);
    console.log(`Batch Cost (Ref): ${pt.recipe_batch_cost}`);
    console.log(`Unit Cost (Calculated): ${pt.recipe_cost}`);
    
    if (pt.recipe_yield > 1) {
        const expected = pt.recipe_batch_cost / pt.recipe_yield;
        console.log(`Expected Unit Cost: ${expected}`);
        if (Math.abs(pt.recipe_cost - expected) < 0.01) {
            console.log("SUCCESS: Cost is correctly normalized by yield.");
        } else {
            console.log("FAILURE: Cost normalization mismatch.");
        }
    } else {
        console.log("Yield is 1, normalization is trivial.");
    }
  }
  process.exit(0);
}

verifyYieldCost().catch(console.error);
