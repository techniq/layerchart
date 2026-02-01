import type { RequestHandler } from './$types';
import { generateLlmsTxt, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	return markdownResponse(generateLlmsTxt(), 'llms.md');
};
