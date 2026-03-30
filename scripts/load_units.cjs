const admin = require('firebase-admin');

// Using the project ID found in test_firestore.cjs
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'delta-core-cloud-45ea0'
    });
}

const db = admin.firestore();

const units = [
    { id: 'und', name: 'Unidades', short: 'und', category: 'Conteo' },
    { id: 'kg', name: 'Kilogramos', short: 'kg', category: 'Peso' },
    { id: 'gr', name: 'Gramos', short: 'gr', category: 'Peso' },
    { id: 'lt', name: 'Litros', short: 'lt', category: 'Volumen' },
    { id: 'ml', name: 'Mililitros', short: 'ml', category: 'Volumen' },
    { id: 'lb', name: 'Libras', short: 'lb', category: 'Peso' },
    { id: 'paq', name: 'Paquete', short: 'paq', category: 'Conteo' },
    { id: 'cja', name: 'Caja', short: 'cja', category: 'Conteo' },
    { id: 'atd', name: 'Atado', short: 'atd', category: 'Conteo' }
];

async function loadUnits() {
    console.log("🚀 Iniciando carga de Unidades de Medida Maestro...");
    const batch = db.batch();
    const collectionRef = db.collection('units');

    for (const unit of units) {
        const docRef = collectionRef.doc(unit.id);
        batch.set(docRef, {
            name: unit.name,
            short: unit.short,
            category: unit.category,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(` - Preparando: ${unit.name} (${unit.short})`);
    }

    await batch.commit();
    console.log("✅ Éxito: Unidades de Medida cargadas correctamente.");
}

loadUnits().catch(err => {
    console.error("❌ Error cargando unidades:", err);
    process.exit(1);
});
