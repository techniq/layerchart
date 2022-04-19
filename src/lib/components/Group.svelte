<script lang="ts">
	import { getContext } from 'svelte';
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

	import { createMotionStore } from '$lib/stores/motionStore';

	const { width, height } = getContext('LayerCake');

	/**
	 * Translate x
	 */
	export let x: number = undefined;

	/**
	 * Translate x
	 */
	export let y: number = undefined;

	/**
	 * Center within chart
	 */
	export let center: boolean = false;

	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	let tweened_x = createMotionStore(x, { spring, tweened });
	let tweened_y = createMotionStore(y, { spring, tweened });

	$: tweened_x.set(x);
	$: tweened_y.set(y);

	let transform = undefined;
	$: if (x != null || y != null) {
		transform = `translate(${$tweened_x ?? 0}, ${$tweened_y ?? 0})`;
	}
	$: if (center) {
		transform = `translate(${$width / 2}, ${$height / 2})`;
	}
</script>

<g {transform} {...$$restProps}>
	<slot />
</g>
