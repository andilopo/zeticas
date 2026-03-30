const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

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

async function checkKeys() {
    console.log("Inspecting Bold keys in Firestore...");
    try {
        const docRef = doc(db, 'site_content', 'web_shipping');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Mode:", data.bold_mode);
            console.log("Sandbox Identity:", data.bold_sandbox_identity ? "Loaded (Starts with " + data.bold_sandbox_identity.substring(0,5) + ")" : "MISSING");
            console.log("Sandbox Secret:", data.bold_sandbox_secret ? "Loaded (Ends with " + data.bold_sandbox_secret.substring(data.bold_sandbox_secret.length - 4) + ")" : "MISSING");
            console.log("Origin City:", data.origin_city);
        } else {
            console.log("Document 'site_content/web_shipping' not found.");
        }
    } catch (err) {
        console.error("Error:", err);
    }
    process.exit(0);
}

checkKeys();
