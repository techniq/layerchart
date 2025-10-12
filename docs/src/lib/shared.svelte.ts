import type { ComponentProps } from 'svelte';
import { Layer } from 'layerchart';

// Shared state for the docs layout
export const shared = $state<{
	layer: ComponentProps<typeof Layer>['type'];
	debug: boolean;
}>({
	layer: 'svg',
	debug: false
});
