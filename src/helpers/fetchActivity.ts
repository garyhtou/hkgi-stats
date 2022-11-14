import axios from 'axios';

const ACTIVITY_URL = 'https://misguided.enterprises/hkgi/activity';

export default async function fetchActivity(): Promise<IRawActivity[]> {
	const resp = await axios.get(ACTIVITY_URL);
	return resp.data;
}

export interface IRawActivity {
	ts: number;
	kind: string;
	who: string;
	what: {
		recipe_index: number;
		plot_index: number;
	};
}
