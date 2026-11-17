import { loadComponentPage } from '$lib/componentPage.js';

export const load = async (event) => loadComponentPage(event.params.name, event);
