<script lang="ts">
	/**
	 * TODO:
	 *   - [ ] Improve zoomable nested (apply extent ratio?  const extentRatio = ($extents.y1 - $extents.y0) / $height;
	 */
	import { getContext } from 'svelte';

	import * as d3 from 'd3-hierarchy';
	import { group } from 'd3-array';

	import ChartClipPath from './ChartClipPath.svelte';
	import { aspectTile } from '../utils/treemap';
	import Bounds from './Bounds.svelte';

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
	export let nodeKey: (node: d3.HierarchyNode<any>, i: number) => any = (node, i) => i;

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

	let treemap;
	$: {
		treemap = d3.treemap().size([$width, $height]).tile(aspectTile(tileFunc, $width, $height));

		if (padding) {
			treemap.padding(padding);
		}
		if (paddingInner) {
			treemap.paddingInner(paddingInner);
		}
		if (paddingOuter) {
			treemap.paddingOuter(paddingOuter);
		}
		if (paddingTop) {
			treemap.paddingTop(paddingTop);
		}
		if (paddingBottom) {
			treemap.paddingBottom(paddingBottom);
		}
		if (paddingLeft) {
			treemap.paddingLeft(paddingLeft);
		}
		if (paddingRight) {
			treemap.paddingRight(paddingRight);
		}
	}

	$: root = treemap($data);
	$: selected = root; // set initial selection

	// group nodes by depth so can be rendered lowest to highest, to stack properly
	$: nodesByDepth = group(root, (d) => d.depth);
</script>

<Bounds extents={selected} let:xScale let:yScale>
	<ChartClipPath>
		{#each Array.from(nodesByDepth) as [depth, nodes]}
			<g>
				{#each nodes as node, i (nodeKey(node, i))}
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
	</ChartClipPath>
</Bounds>
