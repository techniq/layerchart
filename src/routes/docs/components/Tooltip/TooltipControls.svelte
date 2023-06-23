<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, MenuField, Switch } from 'svelte-ux';

	import type TooltipContext from '$lib/components/TooltipContext.svelte';
	import type HighlightRect from '$lib/components/HighlightRect.svelte';

	type TooltipContextProps = ComponentProps<TooltipContext>;
	type HighlightRectProps = ComponentProps<HighlightRect>;

	export let settings: {
		mode: TooltipContextProps['mode'];
		highlight: 'none' | 'line' | 'rect';
		axis: HighlightRectProps['axis'];
		snapToDataX: TooltipContextProps['snapToDataX'];
		snapToDataY: TooltipContextProps['snapToDataX'];
		debug: TooltipContextProps['debug'];
	};
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,1fr,64px] gap-2 mb-2">
	<MenuField
		label="Mode"
		bind:value={settings.mode}
		options={[
			{ label: 'bisect-x', value: 'bisect-x' },
			{ label: 'bisect-y', value: 'bisect-y' },
			{ label: 'bisect-band', value: 'bisect-band' },
			{ label: 'band', value: 'band' },
			{ label: 'bounds', value: 'bounds' },
			{ label: 'voronoi', value: 'voronoi' },
			{ label: 'quadtree', value: 'quadtree' }
		]}
	/>

	<MenuField
		label="Highlight"
		bind:value={settings.highlight}
		options={[
			{ label: 'off', value: 'off' },
			{ label: 'line', value: 'line' },
			{ label: 'rect', value: 'rect' }
		]}
	/>

	<MenuField
		label="Highlight axis"
		bind:value={settings.axis}
		options={[
			{ label: 'default', value: null },
			{ label: 'x', value: 'x' },
			{ label: 'y', value: 'y' },
			{ label: 'both', value: 'both' },
			{ label: 'none', value: 'none' }
		]}
	/>

	<MenuField
		label="Snap to Data"
		value={settings.snapToDataX && settings.snapToDataY
			? 'both'
			: settings.snapToDataX
			? 'x-only'
			: settings.snapToDataY
			? 'y-only'
			: 'off'}
		on:change={(e) => {
			switch (e.detail.value) {
				case 'off':
					settings.snapToDataX = false;
					settings.snapToDataY = false;
					break;
				case 'x-only':
					settings.snapToDataX = true;
					settings.snapToDataY = false;
					break;
				case 'y-only':
					settings.snapToDataX = false;
					settings.snapToDataY = true;
					break;
				case 'both':
					settings.snapToDataX = true;
					settings.snapToDataY = true;
					break;
			}
		}}
		options={[
			{ label: 'off', value: 'off' },
			{ label: 'x-only', value: 'x-only' },
			{ label: 'y-only', value: 'y-only' },
			{ label: 'both', value: 'both' }
		]}
	/>

	<Field label="Debug" let:id>
		<Switch bind:checked={settings.debug} {id} size="md" />
	</Field>
</div>
