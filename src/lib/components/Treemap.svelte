<script lang="ts">
	/**
	 * TODO:
	 *   - [ ] Improve zoomable nested (apply extent ratio?  const extentRatio = ($extents.y1 - $extents.y0) / $height;
	 */
	import { getContext } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	import * as d3 from 'd3-hierarchy';
	import { scaleLinear } from 'd3-scale';
	import { group } from 'd3-array';

	import RectClipPath from './RectClipPath.svelte';
	import { aspectTile } from '../utils/treemap';

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
	$: selected = root; // set initial selection

	// group nodes by height so can be rendered lowest to highest
	$: nodesByHeight = group(root, (d) => d.height);

	const duration = 800;
	const extents = tweened(undefined, { easing: cubicOut, duration });
	$: $extents = selected
		? {
				x0: selected.x0,
				y0: selected.y0,
				x1: selected.x1,
				y1: selected.y1
		  }
		: {
				x0: 0,
				y0: 0,
				x1: $width,
				y1: $height
		  };
	$: xScale = scaleLinear().domain([$extents.x0, $extents.x1]).rangeRound([0, $width]);
	$: yScale = scaleLinear().domain([$extents.y0, $extents.y1]).rangeRound([0, $height]);
</script>

<RectClipPath width={$width} height={$height}>
	{#each Array.from(nodesByHeight) as [height, nodes]}
		<g>
			{#each nodes as node}
				<slot
					name="node"
					{node}
					rect={{
						x: xScale(node.x0),
						y: yScale(node.y0),
						width: xScale(node.x1) - xScale(node.x0),
						height: yScale(node.y1) - yScale(node.y0)
					}}
				/>
			{/each}
		</g>
	{/each}
</RectClipPath>
