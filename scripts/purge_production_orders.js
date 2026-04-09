import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function purgeProductionOrders() {
    console.log('--- INICIANDO BORRADO (WEB SDK): production_orders ---');
    try {
        const snapshot = await getDocs(collection(db, 'production_orders'));
        
        if (snapshot.empty) {
            console.log('La colección "production_orders" ya está vacía.');
            return;
        }

        console.log(`Se encontraron ${snapshot.size} documentos para eliminar.`);
        
        const deletePromises = snapshot.docs.map(document => {
            console.log(`Eliminando doc: ${document.id}`);
            return deleteDoc(doc(db, 'production_orders', document.id));
        });

        await Promise.all(deletePromises);
        console.log('--- BORRADO COMPLETADO EXITOSAMENTE ---');
    } catch (error) {
        console.error('Error durante el borrado:', error);
        process.exit(1);
    }
}

purgeProductionOrders();
