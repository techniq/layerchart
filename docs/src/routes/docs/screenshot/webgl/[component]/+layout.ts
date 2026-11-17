import { loadScreenshotExamples } from '$lib/screenshotExamples.js';

// `@layerchart/webgl`'s components, whose examples are a folder down
export const load = async ({ params }) => loadScreenshotExamples(`webgl/${params.component}`);
