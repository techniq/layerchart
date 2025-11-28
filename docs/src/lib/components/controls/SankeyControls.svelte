<script lang="ts">
	import { RangeField, MenuField } from 'svelte-ux';
	import type { SankeyProps } from 'layerchart';

	export interface SankeyConfig {
		nodeAlign: SankeyProps['nodeAlign'];
		nodeColorBy: 'layer' | 'depth' | 'height' | 'index';
		linkColorBy: 'source' | 'target' | 'static';
		nodePadding: number;
		nodeWidth: number;
	}

	let { config = $bindable() }: { config: SankeyConfig } = $props();
</script>

<div class="grid grid-flow-col gap-1 mb-4 screenshot-hidden">
	<MenuField
		label="Align"
		bind:value={config.nodeAlign}
		options={[
			{ label: 'justify', value: 'justify' },
			{ label: 'left', value: 'left' },
			{ label: 'center', value: 'center' },
			{ label: 'right', value: 'right' }
		]}
	/>

	<MenuField
		label="Node color"
		bind:value={config.nodeColorBy}
		options={[
			{ label: 'layer', value: 'layer' },
			{ label: 'depth', value: 'depth' },
			{ label: 'height', value: 'height' },
			{ label: 'index', value: 'index' }
		]}
	/>

	<MenuField
		label="Link color"
		bind:value={config.linkColorBy}
		options={[
			{ label: 'static', value: 'static' },
			{ label: 'source', value: 'source' },
			{ label: 'target', value: 'target' }
		]}
	/>

	<RangeField label="Node Padding" bind:value={config.nodePadding} max={20} class="col-span-2" />
	<RangeField label="Node Width" bind:value={config.nodeWidth} max={20} />
</div>
