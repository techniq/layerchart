<script lang="ts">
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

	import { motionStore } from '$lib/stores/motionStore';

	export let x: number = 0;
	export let y: number = 0;
	export let width: number;
	export let height: number;
	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	let tweened_x = motionStore(x, { spring, tweened });
	let tweened_y = motionStore(y, { spring, tweened });
	let tweened_width = motionStore(width, { spring, tweened });
	let tweened_height = motionStore(height, { spring, tweened });

	$: tweened_x.set(x);
	$: tweened_y.set(y);
	$: tweened_width.set(width);
	$: tweened_height.set(height);
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<rect
	x={$tweened_x}
	y={$tweened_y}
	width={$tweened_width}
	height={$tweened_height}
	{...$$restProps}
	on:click
	on:mouseover
	on:mouseout
/>
