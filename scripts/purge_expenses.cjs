const admin = require('firebase-admin');

// Inicializar con el ID del proyecto. 
// Si estamos en un entorno autenticado localmente, tomará las credenciales por defecto.
try {
    admin.initializeApp({
        projectId: 'delta-core-cloud-45ea0'
    });
} catch (e) {
    if (e.code !== 'app/duplicate-app') throw e;
}

const db = admin.firestore();

async function purgeExpenses() {
    console.log('--- INICIANDO BORRADO DE COLECCIÓN: expenses ---');
    
    const collectionRef = db.collection('expenses');
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log('La colección "expenses" ya está vacía.');
        return;
    }

    console.log(`Se encontraron ${snapshot.size} documentos para eliminar.`);

    const batchSize = 500; // Límite de batch de Firestore
    let deletedCount = 0;

    // Procesar en batches para mayor seguridad y evitar límites de Firestore
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = docs.slice(i, i + batchSize);
        
        chunk.forEach(doc => {
            batch.delete(doc.ref);
            deletedCount++;
        });

        await batch.commit();
        console.log(`Eliminados ${deletedCount} de ${snapshot.size}...`);
    }

    console.log('--- BORRADO COMPLETADO EXITOSAMENTE ---');
}

purgeExpenses().catch(err => {
    console.error('Error durante la ejecución:', err);
    process.exit(1);
});
