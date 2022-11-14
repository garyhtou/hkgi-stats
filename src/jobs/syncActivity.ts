import fetchActivity, { IRawActivity } from '../helpers/fetchActivity';
import getId, { TId } from '../helpers/getId';
import { db } from '../utils/firebase';

export const INTERVAL = 1000 * 60 * 2.4; // every 2.4 minutes

export default async function syncActivity(): Promise<IActivity[]> {
	console.log('Syncing activity...');
	const rawActivities = await fetchActivity();
	const activities = rawActivities.map((a) => ({
		id: getId(a),
		...a,
	}));

	// Upload only new activities to Firebase Firestore
	const activityRef = db.collection('activity');
	const snapshot = await activityRef.select('id').get();
	const existingIds = snapshot.docs.map((doc) => doc.data().id) as TId[];
	const newActivities = activities.filter((a) => !existingIds.includes(a.id));

	// Batch the batch write commits... firebase only lets you do 500 at a time
	const BATCH_SIZE = 500;
	for (let i = 0; i < newActivities.length; i += BATCH_SIZE) {
		const batch = db.batch();
		const batchActivities = newActivities.slice(i, i + BATCH_SIZE);
		batchActivities.forEach((a) => {
			const docRef = activityRef.doc(a.id);
			batch.set(docRef, a);
		});

		await batch.commit();
		console.log(`Uploaded ${batchActivities.length} activities (batch)`);
	}

	console.log(`Synced a total of ${newActivities.length} new activities`);
	return newActivities;
}

export interface IActivity extends IRawActivity {
	id: TId;
}
