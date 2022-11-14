import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const config = process.env.FIREBASE_CONFIG as string;
if (!config) throw new Error('FIREBASE_CONFIG environment variable is not set');
const firebaseConfig = JSON.parse(config);

const firebase = initializeApp({
	credential: credential.cert(firebaseConfig),
});
const db = getFirestore(firebase);

export { firebase, db };
