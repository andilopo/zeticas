const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'delta-core-cloud-45ea0'
    });
}

const db = admin.firestore();

async function listAll() {
    console.log("Listing all collections in: delta-core-cloud-45ea0");
    const collections = await db.listCollections();
    if (collections.length === 0) {
        console.log("No collections found.");
    } else {
        collections.forEach(collection => {
            console.log(` - ${collection.id}`);
        });
    }
}

listAll().catch(console.error);
