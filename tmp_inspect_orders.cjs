const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccount.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function inspectOrders() {
  console.log('--- INSPECCIONANDO PEDIDOS (ZETICAS) ---');
  const ordersRef = db.collection('orders');
  const snapshot = await ordersRef.get();
  
  if (snapshot.empty) {
    console.log('No se encontraron pedidos.');
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\nID Doc: ${doc.id}`);
    console.log(`ID Pedido: ${data.id || 'No definido'}`);
    console.log(`Cliente: ${data.client || 'No definido'}`);
    console.log(`Status: ${data.status || 'No definido'}`);
    console.log(`Items: ${data.items ? data.items.length : 0}`);
    if (data.items) {
      data.items.forEach((item, i) => {
        console.log(`  - Item ${i+1}: ${item.name} x${item.quantity}`);
      });
    }
  });
}

inspectOrders().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
