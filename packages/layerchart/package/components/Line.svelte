<script>import { motionStore } from '../stores/motionStore';
export let x1;
export let y1;
export let x2;
export let y2;
export let spring = undefined;
export let tweened = undefined;
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
