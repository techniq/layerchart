<script>import { motionStore, resolveOptions } from '../stores/motionStore';
export let x = 0;
export let y = 0;
export let width;
export let height;
export let spring = undefined;
export let tweened = undefined;
let tweened_x = motionStore(x, resolveOptions('x', { spring, tweened }));
let tweened_y = motionStore(y, resolveOptions('y', { spring, tweened }));
let tweened_width = motionStore(width, resolveOptions('width', { spring, tweened }));
let tweened_height = motionStore(height, resolveOptions('height', { spring, tweened }));
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
