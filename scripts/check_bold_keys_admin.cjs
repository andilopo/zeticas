const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'delta-core-cloud-45ea0'
});
const db = admin.firestore();

async function checkBoldKeys() {
    console.log("Inspecting Bold keys in Firestore (Admin)...");
    try {
        const docSnap = await db.collection('site_content').doc('web_shipping').get();
        if (docSnap.exists) {
            const data = docSnap.data();
            console.log("Bold Mode:", data.bold_mode);
            console.log("Sandbox Identity:", data.bold_sandbox_identity ? "MATCH (Length: " + data.bold_sandbox_identity.length + ")" : "MISSING");
            console.log("Sandbox Secret:", data.bold_sandbox_secret ? "MATCH (Length: " + data.bold_sandbox_secret.length + ")" : "MISSING");
            console.log("Redirection Settings:", data.origin_city);
        } else {
            console.log("Document 'site_content/web_shipping' not found.");
        }
    } catch (err) {
        console.error("Error inspecting keys:", err);
    }
}

checkBoldKeys();
