const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json');

if (!process.env.FIREBASE_CONFIG_PATH) {
    // Attempting to use the local serviceAccountKey.json if found
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function cleanupExpenses() {
    console.log("🔍 Buscando gastos de 'Materia Prima / Compras'...");
    // We add a double check: only those with category 'Materia Prima / Compras' or related to a purchase
    const snapshot = await db.collection('expenses')
        .where('category', '==', 'Materia Prima / Compras')
        .get();

    if (snapshot.empty) {
        console.log("✅ No se encontraron gastos para borrar.");
        process.exit(0);
    }

    console.log(`⚠️ Se encontraron ${snapshot.size} gastos. Procediendo a borrar...`);
    
    let deletedCount = 0;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
    });

    await batch.commit();
    console.log(`✨ Paso 1 completado: ${deletedCount} gastos eliminados correctamente.`);
    process.exit(0);
}

cleanupExpenses().catch(err => {
    console.error("❌ Error en el borrado:", err);
    process.exit(1);
});
