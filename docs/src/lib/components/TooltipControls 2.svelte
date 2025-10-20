<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, MenuField, MultiSelectField, Switch } from 'svelte-ux';

	import type TooltipContext from '$lib/components/tooltip/TooltipContext.svelte';
	import type Highlight from '$lib/components/Highlight.svelte';

	type TooltipContextProps = ComponentProps<typeof TooltipContext>;
	type HighlightProps = ComponentProps<typeof Highlight>;

	let {
		settings = $bindable()
	}: {
		settings: {
			mode: TooltipContextProps['mode'];
			highlight: Array<'none' | 'points' | 'lines' | 'area' | 'bar'>;
			axis: HighlightProps['axis'];
			snapToDataX: boolean;
			snapToDataY: boolean;
			debug: TooltipContextProps['debug'];
		};
	} = $props();
</script>

<div class="grid grid-cols-[1fr_1fr_120px_120px_64px] gap-2 mb-2">
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
			{ label: 'quadtree', value: 'quadtree' },
			{ label: 'quadtree-x', value: 'quadtree-x' },
			{ label: 'quadtree-y', value: 'quadtree-y' }
		]}
	/>

	<MultiSelectField
		label="Highlight"
		bind:value={settings.highlight}
		options={[
			{ label: 'points', value: 'points' },
			{ label: 'lines', value: 'lines' },
			{ label: 'area', value: 'area' },
			{ label: 'bar', value: 'bar' }
		]}
		formatSelected={({ options }) => options.map((x) => x.label).join(', ')}
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
