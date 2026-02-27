import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (!projectId || !clientEmail || !privateKey) {
        console.error(
            'Firebase admin initialization error: Missing required environment variables.',
            { projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!privateKey }
        );
    } else {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    // Handle newlines in the private key
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('Firebase admin initialization error', error);
        }
    }
}

const adminDb = admin.apps.length ? admin.firestore() : null;

export { adminDb };
