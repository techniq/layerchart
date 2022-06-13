<script lang="ts">
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

	import { motionStore } from '$lib/stores/motionStore';

	export let cx: number;
	export let cy: number;
	export let r: number;
	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	let tweened_cx = motionStore(cx, { spring, tweened });
	let tweened_cy = motionStore(cy, { spring, tweened });
	let tweened_r = motionStore(r, { spring, tweened });

	$: tweened_cx.set(cx);
	$: tweened_cy.set(cy);
	$: tweened_r.set(r);
</script>

<circle cx={$tweened_cx} cy={$tweened_cy} r={$tweened_r} {...$$restProps} />
