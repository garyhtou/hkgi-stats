import express, { Router, Request, Response } from 'express';
import getActivity from './helpers/getActivity';
import syncActivity from './jobs/syncActivity';

const router: Router = express.Router();

// Express body-parser
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Ping Pong (test endpoint)
router.get('/ping', (req: Request, res: Response) => {
	res.send('pong! 🏓');
});

router.get('/activity', async (req: Request, res: Response) => {
	const order = req.query.order?.toString();
	const limit = req.query.limit?.toString();
	const activity = await getActivity(limit, order);
	res.json(activity);
});

router.get('/activity/sync', async (req: Request, res: Response) => {
	console.log('Request to sync activity');
	const activity = await syncActivity();
	res.json(activity);
});

export default router;
