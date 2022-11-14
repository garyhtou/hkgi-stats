import { IActivity } from '../jobs/syncActivity';
import { db } from '../utils/firebase';

var cachedActivities: IActivity[] = [];
const cacheTtl = 1000 * 60 * 10; // 10 minute
var lastCachedAt = 0;

export default async function getActivity(): Promise<IActivity[]> {
	if (cachedActivities.length && Date.now() - lastCachedAt < cacheTtl) {
		console.log('Returning cached activities');
		return cachedActivities;
	}

	// Get activities from Firebase Firestore
	const snapshot = await db.collection('activity').orderBy('ts', 'desc').get();
	const activities = snapshot.docs.map((doc) => doc.data()) as IActivity[];
	lastCachedAt = Date.now();
	return activities;
}

export async function invalidateCache(): Promise<void> {
	cachedActivities = [];
}

// Use realtime subscription to update activity cache
db.collection('activity').onSnapshot((snapshot) => {
	console.log('Updating activity cache from realtime subscription');
	const activities = snapshot.docs.map((doc) => doc.data()) as IActivity[];
	cachedActivities = activities;
	lastCachedAt = Date.now();
});
