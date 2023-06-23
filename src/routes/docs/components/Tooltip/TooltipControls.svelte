<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

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

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup
			bind:value={settings.mode}
			variant="contained"
			classes={{ root: 'w-full', options: 'w-full' }}
		>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup
			bind:value={settings.highlight}
			variant="contained"
			classes={{ root: 'w-full', options: 'w-full' }}
		>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup
			bind:value={settings.axis}
			variant="contained"
			classes={{ root: 'w-full', options: 'w-full' }}
		>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup
				bind:value={settings.snapToDataX}
				variant="contained"
				classes={{ root: 'w-full', options: 'w-full' }}
			>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup
				bind:value={settings.snapToDataY}
				variant="contained"
				classes={{ root: 'w-full', options: 'w-full' }}
			>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={settings.debug} {id} />
	</Field>
</div>
