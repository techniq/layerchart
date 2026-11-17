import { loadScreenshotExamples } from '$lib/screenshotExamples.js';

export const load = async ({ params }) => loadScreenshotExamples(params.component);
