import { db } from '../src/lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function takePhotograph() {
    console.log("📸 Tomando fotografía del inventario actual...");
    const snapshot = await getDocs(collection(db, 'products'));
    const inventory = [];
    
    snapshot.forEach(doc => {
        inventory.push({
            id: doc.id,
            ...doc.data()
        });
    });

    const backupPath = path.join(process.cwd(), 'scratch', `inventory_backup_${new Date().getTime()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(inventory, null, 2));
    
    console.log(`✅ Fotografía guardada exitosamente en: ${backupPath}`);
    console.log(`📊 Total de items respaldados: ${inventory.length}`);
    process.exit(0);
}

takePhotograph().catch(err => {
    console.error("❌ Error al tomar la fotografía:", err);
    process.exit(1);
});
