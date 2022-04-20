<script lang="ts">
	import { getContext } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import * as d3 from 'd3-hierarchy';
	import { scaleLinear } from 'd3-scale';

	import TreemapNode from './TreemapNode.svelte';
	import RectClipPath from './RectClipPath.svelte';
	import { aspectTile } from '$lib/utils/treemap';

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

	$: treemap = d3
		.treemap()
		.size([$width, $height])
		.tile(aspectTile(tileFunc, $width, $height))
		.padding(padding)
		.paddingInner(paddingInner)
		.paddingOuter(paddingOuter);

	$: root = treemap($data);

	$: selected = root;

	function selectNode(node) {
		while (node.parent && node.parent !== selected) {
			node = node.parent;
		}

		if (node && node.children) {
			selected = node;
		}
	}

	// const breadcrumbs = (node) => {
	// 	const crumbs = [];
	// 	while (node) {
	// 		crumbs.unshift(node.data.name);
	// 		node = node.parent;
	// 	}

	// 	return crumbs.join('/');
	// };

	function isVisible(a, b) {
		while (b) {
			if (a.parent === b) return true;
			b = b.parent;
		}

		return false;
	}

	const duration = 800;

	const extents = tweened(undefined, {
		easing: cubicOut,
		duration
	});
	$: $extents = {
		x0: selected.x0,
		x1: selected.x1,
		y0: selected.y0,
		y1: selected.y1
	};

	$: xScale = scaleLinear().domain([$extents.x0, $extents.x1]).rangeRound([0, $width]);
	$: yScale = scaleLinear().domain([$extents.y0, $extents.y1]).rangeRound([0, $height]);
</script>

<RectClipPath width={$width} height={$height} let:id>
	<g style="clip-path: url(#{id})">
		<TreemapNode node={root} {xScale} {yScale} let:node let:rect>
			{#if isVisible(node, selected)}
				<g on:click={() => selectNode(node)} transition:fade={{ duration }}>
					<slot {node} {rect} />
				</g>
			{/if}
		</TreemapNode>
	</g>
</RectClipPath>
