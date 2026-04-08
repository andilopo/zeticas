
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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
    console.log("--- RECIPES ---");
    const snap = await getDocs(collection(db, "recipes"));
    snap.docs.forEach(doc => {
        const d = doc.data();
        console.log(`[${doc.id}] FG_ID: ${d.finished_good_id} | FG_NAME: ${d.finished_good_name} | RM_NAME: ${d.raw_material_name}`);
    });
}

inspect();
