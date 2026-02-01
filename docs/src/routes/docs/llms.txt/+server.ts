import type { RequestHandler } from './$types';
import { generateFullLlmsTxt, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	return markdownResponse(generateFullLlmsTxt(), 'llms-full.md');
};
