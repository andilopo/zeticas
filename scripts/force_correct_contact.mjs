import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';

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

const NEW_CONTACT = {
    email: 'hola@zeticas.com',
    instagram: 'https://instagram.com/zeticas',
    linkedin: 'https://linkedin.com/company/zeticas',
    phone: '+573100000000'
};

async function updateLiveContact() {
    console.log('🔄 Actualizando campos de contacto en Firestore...');
    try {
        for (const [key, content] of Object.entries(NEW_CONTACT)) {
            const fieldKey = `contact_${key}`;
            const q = query(collection(db, 'site_content'), 
                where('section', '==', 'web_shipping'), 
                where('key', '==', fieldKey));
            
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                console.log(`➕ Creando campo faltante: web_shipping.${fieldKey}`);
                await addDoc(collection(db, 'site_content'), {
                    section: 'web_shipping',
                    key: fieldKey,
                    content: content,
                    created_at: new Date().toISOString()
                });
            } else {
                console.log(`✅ Actualizando campo existente: web_shipping.${fieldKey}`);
                await updateDoc(doc(db, 'site_content', snapshot.docs[0].id), {
                    content: content,
                    updated_at: new Date().toISOString()
                });
            }
        }
        console.log('🔥 ¡DATOS ACTUALIZADOS EN FIRESTORE! 🔥');
    } catch (error) {
        console.error('❌ Error al actualizar Firestore:', error);
    }
}

updateLiveContact();
