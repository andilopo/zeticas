const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'delta-core-cloud-45ea0'
});
const db = admin.firestore();

async function inspect() {
  console.log("--- INVESTIGANDO CAMPOS DE LA COLECCION 'ORDERS' ---");
  
  // 1. Buscar una muestra general de pedidos
  const snapshot = await db.collection('orders').limit(5).get();
  
  if (snapshot.empty) {
    console.log("⚠️ No se encontraron documentos en la colección 'orders'.");
    return;
  }

  const allKeys = new Set();
  snapshot.docs.forEach(doc => {
    Object.keys(doc.data()).forEach(key => allKeys.add(key));
  });

  console.log("\nCampos (Keys) encontrados en la colección 'orders':");
  console.log(Array.from(allKeys).sort().join(', '));

  console.log("\n--- DETALLE DE UNA MUESTRA (Campos de archivado/kanban) ---");
  const sampleData = snapshot.docs[0].data();
  console.log(JSON.stringify(sampleData, null, 2));

  // 2. Buscar específicamente pedidos con kanban_hidden
  console.log("\n--- BUSCANDO PEDIDOS ARCHIVADOS EN KANBAN (kanban_hidden: true) ---");
  const archivedSnap = await db.collection('orders').where('kanban_hidden', '==', true).limit(3).get();
  
  if (archivedSnap.empty) {
    console.log("No hay pedidos con kanban_hidden: true actualmente.");
  } else {
    archivedSnap.docs.forEach(doc => {
      const data = doc.data();
      console.log(`\nPedido: ${data.order_number || doc.id}`);
      console.log(`- kanban_hidden: ${data.kanban_hidden}`);
      console.log(`- kanban_archived_at: ${data.kanban_archived_at || 'NO EXISTE'}`);
      console.log(`- last_status_at: ${data.last_status_at || 'NO EXISTE'}`);
      console.log(`- created_at: ${data.created_at}`);
    });
  }

  process.exit(0);
}

inspect().catch(console.error);
