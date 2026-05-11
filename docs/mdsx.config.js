import { createMdsxConfig } from '@layerstack/docs/markdown/config';

export const mdsxConfig = createMdsxConfig({
	markdownComponentsPath: '@layerstack/docs/markdown/components',
	exampleComponentPath: '$lib/components',
	liveCodeComponent: '@layerstack/docs/markdown/components/LiveCode.svelte'
});
