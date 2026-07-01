<script lang="ts">
	// Thin adapter around the shared `@layerstack/docs` component, injecting
	// LayerChart-specific config (branding + the active chart `layer`) so existing
	// call sites can keep using `<OpenWithButton {metadata} />` unchanged.
	import { getSettings } from 'layerchart';
	import { OpenWithButton } from '@layerstack/docs/components';

	let { metadata = {}, example = false } = $props();
	const settings = getSettings();

	const pkg = {
		name: 'LayerChart',
		url: 'https://layerchart.com/docs',
		description: 'A charting/visualization library for Svelte 5'
	};
</script>

<OpenWithButton {metadata} {example} {pkg} layer={settings?.layer} />
