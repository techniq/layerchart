<script>
	import { getContext } from 'svelte';

	import Group from './Group.svelte';
	import RectClipPath from './RectClipPath.svelte';

	const { xGet, yGet, xDomain, yDomain, extents } = getContext('LayerCake');

	export let node;
	export let xScale;
	export let yScale;
</script>

<RectClipPath
	width={xScale(node.x1) - xScale(node.x0)}
	height={yScale(node.y1) - yScale(node.y0)}
	let:id
>
	<Group x={xScale(node.x0)} y={yScale(node.y0)} style="clip-path: url(#{id})" on:click>
		<slot
			{node}
			rect={{
				x: 0, // xScale(node.x0),
				y: 0, // yScale(node.y0),
				width: xScale(node.x1) - xScale(node.x0),
				height: yScale(node.y1) - yScale(node.y0)
			}}
		/>
	</Group>
</RectClipPath>

{#each node.children || [] as child}
	<svelte:self node={child} {xScale} {yScale} let:node let:rect>
		<slot {node} {rect} />
	</svelte:self>
{/each}
