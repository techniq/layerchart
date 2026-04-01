import type { RequestHandler } from './$types';
import { generateFullLlmsTxt, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ url }) => {
	return markdownResponse(generateFullLlmsTxt(url.origin), 'llms-full.md');
};
