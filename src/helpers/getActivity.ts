import { IActivity } from '../jobs/syncActivity';
import { db } from '../utils/firebase';

export default async function getActivity(): Promise<IActivity[]> {
	// Get activities from Firebase Firestore
	const snapshot = await db.collection('activity').orderBy('ts', 'desc').get();
	const activities = snapshot.docs.map((doc) => doc.data()) as IActivity[];
	return activities;
}
