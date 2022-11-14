import fetchActivity, { IRawActivity } from '../helpers/fetchActivity';
import getId, { TId } from '../helpers/getId';
import { db } from '../utils/firebase';

export const INTERVAL = 1000 * 20; // every 20 seconds

export default async function syncActivity(): Promise<IActivity[]> {
	console.log('Syncing activity...');
	const rawActivities = await fetchActivity();
	const activities = rawActivities.map((a) => ({
		id: getId(a),
		...a,
	}));

	// Upload only new activities to Firebase Firestore
	const batch = db.batch();
	const activityRef = db.collection('activity');
	const snapshot = await activityRef.get();
	const existingIds = snapshot.docs.map((doc) => doc.id);
	const newActivities = activities.filter((a) => !existingIds.includes(a.id));
	newActivities.forEach((a) => {
		const docRef = activityRef.doc(a.id);
		batch.set(docRef, a);
	});
	await batch.commit();

	console.log(`Synced ${newActivities.length} new activities`);
	return newActivities;
}

export interface IActivity extends IRawActivity {
	id: TId;
}
