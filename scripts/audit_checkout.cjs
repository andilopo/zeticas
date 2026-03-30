const admin = require('firebase-admin');

async function auditFlow() {
    console.log("--- Starting Checkout Flow Audit ---");
    try {
        if (!admin.apps.length) {
            admin.initializeApp({ projectId: 'delta-core-cloud-45ea0' });
        }
        const db = admin.firestore();

        // 1. Check most recent web_checkouts
        console.log("\n1. Recent Web Checkouts (Drafts):");
        const drafts = await db.collection('web_checkouts').orderBy('createdAt', 'desc').limit(2).get();
        drafts.forEach(doc => {
            const data = doc.data();
            console.log(` - ID: ${doc.id} | Status: ${data.status} | Client: ${data.formData?.nombreCompleto} | CreatedAt: ${data.createdAt?.toDate?.() || data.createdAt}`);
        });

        // 2. Check most recent Orders
        console.log("\n2. Recent Orders (Permanent):");
        const orders = await db.collection('orders').orderBy('date', 'desc').limit(3).get();
        orders.forEach(doc => {
            const data = doc.data();
            console.log(` - Order#: ${data.order_number} | Status: ${data.status} | Client: ${data.client} | Source: ${data.source}`);
        });

        // 3. Check for clients added today
        console.log("\n3. Recent Clients:");
        const clients = await db.collection('clients').orderBy('nit', 'desc').limit(2).get();
        clients.forEach(doc => {
            console.log(` - Client: ${doc.data().name} | NIT: ${doc.data().nit} | Source: ${doc.data().source}`);
        });

    } catch (err) {
        console.error("Audit failed:", err.message);
    }
}

auditFlow().then(() => process.exit(0));
