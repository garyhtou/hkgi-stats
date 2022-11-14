import { IActivity } from '../jobs/syncActivity';
import { db } from '../utils/firebase';

var cachedActivities: IActivity[] = [];
const cacheTtl = 1000 * 60 * 10; // 10 minute
var lastCachedAt = 0;

const PARAMS: { [k: string]: { default: any; clean: Function } } = {
	limit: {
		default: 100,
		clean: (x?: string) => {
			const v = parseInt(x);
			return isNaN(v) && v > 0 && v <= 500 ? PARAMS.limit.default : v;
		},
	},
	order: {
		default: 'desc',
		clean: (x?: string) => {
			const v = x?.toLowerCase()?.trim();
			return ['asc', 'desc'].includes(v) ? v : PARAMS.order.default;
		},
	},
};

export default async function getActivity(
	limit: number | string,
	order: string
): Promise<IActivity[]> {
	const orderArg = PARAMS.order.clean(order);
	const limitArg = PARAMS.limit.clean(limit);

	// Return cached activities if cache is not stale
	if (cachedActivities.length && Date.now() - lastCachedAt < cacheTtl) {
		console.log('Returning cached activities');
		return cachedActivities
			.sort((a, b) => {
				if (orderArg === 'asc') return a.ts - b.ts;
				return b.ts - a.ts;
			})
			.slice(0, limitArg);
	}

	// Get activities from Firebase Firestore
	const snapshot = await db
		.collection('activity')
		.orderBy('ts', orderArg)
		.limit(limitArg)
		.get();
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

export function cleanParam(param: string, arg: string) {
	const { default: def, clean: validate } = PARAMS[param];
	const value = validate(arg) ? arg : def;
	if (!validate(value)) throw new Error(`Invalid ${param} parameter: ${arg}`);
	return value;
}
