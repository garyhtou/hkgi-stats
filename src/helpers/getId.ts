import hash from 'object-hash';

export default function getId(obj: any) {
	return hash(obj);
}

export type TId = string;
