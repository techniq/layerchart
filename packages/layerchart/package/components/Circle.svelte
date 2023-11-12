<script>import { motionStore } from '../stores/motionStore';
export let cx = 0;
export let cy = 0;
export let r;
export let spring = undefined;
export let tweened = undefined;
let tweened_cx = motionStore(cx, { spring, tweened });
let tweened_cy = motionStore(cy, { spring, tweened });
let tweened_r = motionStore(r, { spring, tweened });
$: tweened_cx.set(cx);
$: tweened_cy.set(cy);
$: tweened_r.set(r);
</script>

<circle
	cx={$tweened_cx}
	cy={$tweened_cy}
	r={$tweened_r}
	{...$$restProps}
	on:click
	on:mousemove
	on:mouseleave
/>
