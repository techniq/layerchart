<script lang="ts">
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

	import { motionStore } from '$lib/stores/motionStore';

	export let x1: number;
	export let y1: number;
	export let x2: number;
	export let y2: number;
	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	let tweened_x1 = motionStore(x1, { spring, tweened });
	let tweened_y1 = motionStore(y1, { spring, tweened });
	let tweened_x2 = motionStore(x2, { spring, tweened });
	let tweened_y2 = motionStore(y2, { spring, tweened });

	$: tweened_x1.set(x1);
	$: tweened_y1.set(y1);
	$: tweened_x2.set(x2);
	$: tweened_y2.set(y2);
</script>

<line
	x1={$tweened_x1}
	y1={$tweened_y1}
	x2={$tweened_x2}
	y2={$tweened_y2}
	{...$$restProps}
	on:click
	on:mousemove
	on:mouseleave
/>
