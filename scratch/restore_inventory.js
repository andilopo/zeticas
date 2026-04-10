import { db } from '../src/lib/firebase.js';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function restoreInventory(backupFile) {
    if (!backupFile) {
        console.error("❌ Por favor especifica el nombre del archivo de respaldo en scratch/");
        process.exit(1);
    }

    const backupPath = path.join(process.cwd(), 'scratch', backupFile);
    if (!fs.existsSync(backupPath)) {
        console.error(`❌ El archivo ${backupPath} no existe.`);
        process.exit(1);
    }

    console.log(`💉 Iniciando inyección de inventario desde: ${backupFile}...`);
    const inventory = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // 1. Limpiar la colección actual (Activado por solicitud del usuario)
    console.log("🧹 Limpiando colección actual...");
    const snapshot = await getDocs(collection(db, 'products'));
    for (const dContent of snapshot.docs) {
        await deleteDoc(doc(db, 'products', dContent.id));
    }

    // 2. Inyectar datos del respaldo
    let count = 0;
    for (const item of inventory) {
        const { id, ...data } = item;
        await setDoc(doc(db, 'products', id), data);
        count++;
        if (count % 10 === 0) console.log(`   Restaurados ${count}/${inventory.length} items...`);
    }

    console.log(`✅ Inyección completada. ${count} items restaurados.`);
    process.exit(0);
}

const fileArg = process.argv[2];
restoreInventory(fileArg).catch(err => {
    console.error("❌ Error durante la inyección:", err);
    process.exit(1);
});
