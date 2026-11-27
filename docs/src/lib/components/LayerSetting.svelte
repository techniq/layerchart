<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getSettings, setSettings, type SettingsOptions } from 'layerchart';

	/** The charts inside draw in `layer`, with the page's other settings (`debug`, `view`) */
	let { layer, children }: { layer: NonNullable<SettingsOptions['layer']>; children: Snippet } =
		$props();

	const page = getSettings();
	// svelte-ignore state_referenced_locally
	const settings = setSettings({ layer, debug: page.debug, view: page.view });

	$effect.pre(() => {
		settings.layer = layer;
		settings.debug = page.debug;
		settings.view = page.view;
	});
</script>

{@render children()}
