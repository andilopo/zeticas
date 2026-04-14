// Using native fetch from Node 24+


const PROJECT_ID = 'delta-core-cloud-45ea0';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getDocuments(collectionName) {
  const response = await fetch(`${BASE_URL}/${collectionName}`);
  const data = await response.json();
  return data.documents || [];
}

async function updateDocument(collectionName, docId, fields, mask) {
  const updateMask = mask.map(m => `updateMask.fieldPaths=${m}`).join('&');
  const url = `${BASE_URL}/${collectionName}/${docId}?${updateMask}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

async function deleteDocument(collectionName, docId) {
  const url = `${BASE_URL}/${collectionName}/${docId}`;
  const response = await fetch(url, { method: 'DELETE' });
  return response.status === 200;
}

async function sanitize() {
  console.log("--- INICIANDO SANEAMIENTO REST API ---");

  // 1. Resetear contadores en productos
  console.log("📦 Reseteando contadores en 'products'...");
  const products = await getDocuments('products');
  for (const doc of products) {
    const docId = doc.name.split('/').pop();
    await updateDocument('products', docId, {
      purchases: { integerValue: "0" },
      sales: { integerValue: "0" }
    }, ['purchases', 'sales']);
  }
  console.log(`✅ ${products.length} productos actualizados.`);

  // 2. Limpiar colecciones transaccionales
  const toDelete = [
    'orders',
    'purchase_orders',
    'expenses',
    'bank_transactions',
    'production_orders',
    'analytics',
    'production_analytics',
    'web_checkouts',
    'quotations'
  ];

  for (const collectionName of toDelete) {
    console.log(`🗑️ Borrando colección: ${collectionName}...`);
    const docs = await getDocuments(collectionName);
    for (const doc of docs) {
      const docId = doc.name.split('/').pop();
      await deleteDocument(collectionName, docId);
    }
    console.log(`✅ Colección ${collectionName} vaciada (${docs.length} docs).`);
  }

  // 3. Resetear Bancos
  console.log("🏦 Reseteando saldos bancarios...");
  const banks = await getDocuments('banks');
  for (const doc of banks) {
    const docId = doc.name.split('/').pop();
    const data = doc.fields || {};
    const initial = data.initial_balance ? (data.initial_balance.integerValue || data.initial_balance.doubleValue || "0") : "0";
    
    await updateDocument('banks', docId, {
      balance: { doubleValue: parseFloat(initial) },
      real_time: { doubleValue: parseFloat(initial) },
      updated_at: { stringValue: new Date().toISOString() }
    }, ['balance', 'real_time', 'updated_at']);
  }
  console.log(`✅ ${banks.length} bancos reseteados.`);

  // 4. Resetear contadores secuenciales
  console.log("🔢 Reseteando contadores secuenciales...");
  await updateDocument('metadata', 'counters', {
    last_order_number: { integerValue: "0" },
    last_purchase_number: { integerValue: "0" },
    last_production_number: { integerValue: "0" }
  }, ['last_order_number', 'last_purchase_number', 'last_production_number']);
  console.log("✅ Contadores en metadatos reseteados.");

  console.log("--- SANEAMIENTO COMPLETADO ---");
}

sanitize().catch(console.error);
