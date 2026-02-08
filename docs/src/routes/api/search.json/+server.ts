import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchContent } from '../../docs/search/searchContent';

export const prerender = true;

export const GET: RequestHandler = async () => {
	return json(searchContent);
};
