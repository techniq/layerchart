<script>
	import { getContext } from 'svelte';

	import Group from './Group.svelte';
	import RectClipPath from './RectClipPath.svelte';

	const { xGet, yGet, xDomain, yDomain, extents } = getContext('LayerCake');

	export let node;
	export let xScale;
	export let yScale;
</script>

<Group x={xScale(node.x0)} y={yScale(node.y0)} on:click>
	<RectClipPath
		width={xScale(node.x1) - xScale(node.x0)}
		height={yScale(node.y1) - yScale(node.y0)}
	>
		<slot
			{node}
			rect={{
				x: 0, // xScale(node.x0),
				y: 0, // yScale(node.y0),
				width: xScale(node.x1) - xScale(node.x0),
				height: yScale(node.y1) - yScale(node.y0)
			}}
		/>
	</RectClipPath>
</Group>

{#each node.children || [] as child}
	<svelte:self node={child} {xScale} {yScale} let:node let:rect>
		<slot {node} {rect} />
	</svelte:self>
{/each}
