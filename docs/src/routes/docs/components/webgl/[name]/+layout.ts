import { loadComponentPage } from '$lib/componentPage.js';

// `@layerchart/webgl`'s components, whose names repeat LayerChart's (ex. `Points`)
export const load = async (event) => loadComponentPage(`webgl/${event.params.name}`, event);
