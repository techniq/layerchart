import type { ComponentProps } from 'svelte';
import { Layer } from 'layerchart';

// Shared state for the docs layout
export const shared = $state<{
  renderContext: ComponentProps<typeof Layer>['type'];
  debug: boolean;
}>({
  renderContext: 'svg',
  debug: false,
});
