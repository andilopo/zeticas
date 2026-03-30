const admin = require('firebase-admin');

async function test() {
    console.log("Starting Bold Key Audit...");
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: 'delta-core-cloud-45ea0'
            });
        }
        const db = admin.firestore();
        const docSnap = await db.collection('site_content').doc('web_shipping').get();
        if (docSnap.exists) {
            const data = docSnap.data();
            console.log("--- BOLD CONFIG ---");
            console.log("Mode:", data.bold_mode);
            console.log("Sandbox ID Length:", data.bold_sandbox_identity ? data.bold_sandbox_identity.length : 0);
            console.log("Sandbox Secret Length:", data.bold_sandbox_secret ? data.bold_sandbox_secret.length : 0);
            console.log("Prod ID Length:", data.bold_prod_identity ? data.bold_prod_identity.length : 0);
            console.log("--- END ---");
        } else {
            console.log("ERROR: Document not found.");
        }
    } catch (err) {
        console.error("CRITICAL ERROR:", err.message);
    }
}

test().then(() => process.exit(0));
