// LayerChart's examples drawn with WebGL (see `vite-plugin-webgl-examples.ts`)
declare module 'virtual:webgl-examples' {
	import type { Component } from 'svelte';

	/** `<component>/<name>` (ex. `Points/basic`) to a loader of its WebGL version */
	export const webglExamples: Record<
		string,
		() => Promise<{ component: Component; source: string }>
	>;
}
