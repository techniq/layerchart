<script lang="ts">
	import { getContext } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import * as d3 from 'd3-hierarchy';
	import { scaleLinear } from 'd3-scale';

	import TreemapNode from './TreemapNode.svelte';
	import RectClipPath from './RectClipPath.svelte';
	import { aspectTile } from '../utils/treemap';
	import { group } from 'd3-array';

	const { data, width, height } = getContext('LayerCake');

	export let tile:
		| typeof d3.treemapSquarify
		| 'binary'
		| 'squarify'
		| 'resquarify'
		| 'dice'
		| 'slice'
		| 'sliceDice' = d3.treemapSquarify;
	export let padding = 0;
	export let paddingInner = 0;
	export let paddingOuter = 0;
	export let paddingTop = 0;
	export let paddingBottom = 0;
	export let paddingLeft = undefined;
	export let paddingRight = undefined;

	export let selected = null;
	export let zoomable = false;

	$: tileFunc =
		tile === 'squarify'
			? d3.treemapSquarify
			: tile === 'resquarify'
			? d3.treemapResquarify
			: tile === 'binary'
			? d3.treemapBinary
			: tile === 'dice'
			? d3.treemapDice
			: tile === 'slice'
			? d3.treemapSlice
			: tile === 'sliceDice'
			? d3.treemapSliceDice
			: tile;

	$: treemap = d3.treemap().size([$width, $height]).tile(aspectTile(tileFunc, $width, $height));

	$: if (padding) {
		treemap.padding(padding);
	}
	$: if (paddingInner) {
		treemap.paddingInner(paddingInner);
	}
	$: if (paddingOuter) {
		treemap.paddingOuter(paddingOuter);
	}
	$: if (paddingTop) {
		treemap.paddingTop(paddingTop);
	}
	$: if (paddingBottom) {
		treemap.paddingBottom(paddingBottom);
	}
	$: if (paddingLeft) {
		treemap.paddingLeft(paddingLeft);
	}
	$: if (paddingLeft) {
		treemap.paddingRight(paddingRight);
	}

	$: root = treemap($data);

	// zoomable
	$: selected = root; // update initial selection

	// nested
	$: nodesByHeight = group(root, (d) => d.height);

	/**
	 * Show if the node (a) is a child of the selected (b), or any parent of the selected
	 */
	function isVisible(a, b) {
		while (b) {
			if (a.parent === b) return true;
			b = b.parent;
		}

		return false;
	}

	const duration = 800;
	const extents = tweened(undefined, { easing: cubicOut, duration });
	$: $extents = {
		x0: selected.x0,
		x1: selected.x1,
		y0: selected.y0,
		y1: selected.y1
	};

	$: xScale = scaleLinear().domain([$extents.x0, $extents.x1]).rangeRound([0, $width]);
	$: yScale = scaleLinear().domain([$extents.y0, $extents.y1]).rangeRound([0, $height]);
</script>

{#if zoomable}
	<RectClipPath width={$width} height={$height}>
		<TreemapNode node={root} {xScale} {yScale} let:node let:rect>
			{#if isVisible(node, selected)}
				<slot {node} {rect} />
			{/if}
		</TreemapNode>
	</RectClipPath>
{:else}
	{#each Array.from(nodesByHeight) as [height, nodes]}
		{#each nodes as node}
			<slot {node} />
		{/each}
	{/each}
{/if}
