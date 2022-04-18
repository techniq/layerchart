<script lang="ts">
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

	import { getMotionStore } from '$lib/stores/motionStore';

	export let x: number;
	export let y: number;
	export let width: number;
	export let height: number;
	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	let tweened_x = getMotionStore(x, { spring, tweened });
	let tweened_y = getMotionStore(y, { spring, tweened });
	let tweened_width = getMotionStore(width, { spring, tweened });
	let tweened_height = getMotionStore(height, { spring, tweened });

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
