import * as syncActivity from './syncActivity';

// List jobs to run
const JOBS = [syncActivity];

JOBS.forEach((job) => {
	const action = job.default;
	const interval = job.INTERVAL;
	setInterval(action, interval);
});
