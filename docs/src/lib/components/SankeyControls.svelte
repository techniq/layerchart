<script lang="ts">
	import { RangeField, MenuField } from 'svelte-ux';
	import type { SankeyProps } from 'layerchart';

	// <SankeyControls bind:nodeAlign bind:nodeColorBy bind:linkColorBy bind:nodePadding bind:nodeWidth />

	let {
		nodeAlign = $bindable(),
		nodeColorBy = $bindable(),
		linkColorBy = $bindable(),
		nodePadding = $bindable(),
		nodeWidth = $bindable()
	}: {
		nodeAlign: SankeyProps['nodeAlign'];
		nodeColorBy: 'layer' | 'depth' | 'height' | 'index';
		linkColorBy: 'source' | 'target' | 'static';
		nodePadding: number;
		nodeWidth: number;
	} = $props();
</script>

<div class="grid grid-flow-col gap-1 mb-4 screenshot-hidden">
	<MenuField
		label="Align"
		bind:value={nodeAlign}
		options={[
			{ label: 'justify', value: 'justify' },
			{ label: 'left', value: 'left' },
			{ label: 'center', value: 'center' },
			{ label: 'right', value: 'right' }
		]}
	/>

	<MenuField
		label="Node color"
		bind:value={nodeColorBy}
		options={[
			{ label: 'layer', value: 'layer' },
			{ label: 'depth', value: 'depth' },
			{ label: 'height', value: 'height' },
			{ label: 'index', value: 'index' }
		]}
	/>

	<div class="screenshot-hidden">
		<MenuField
			label="Link color"
			bind:value={linkColorBy}
			options={[
				{ label: 'static', value: 'static' },
				{ label: 'source', value: 'source' },
				{ label: 'target', value: 'target' }
			]}
		/>

		<RangeField label="Node Padding" bind:value={nodePadding} max={20} />
		<RangeField label="Node Width" bind:value={nodeWidth} max={20} />
	</div>
</div>
