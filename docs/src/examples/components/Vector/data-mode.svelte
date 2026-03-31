<script lang="ts">
	import { Chart, Vector, Axis, Layer } from 'layerchart';

	const cols = 30;
	const rows = 14;

	const data = Array.from({ length: cols * rows }, (_, i) => ({
		x: (i % cols) * (100 / cols) + 100 / cols / 2,
		y: Math.floor(i / cols) * 7 + 3.5
	}));

	let mouseX = $state(50);
	let mouseY = $state(50);
</script>

<Chart
	x="x"
	y="y"
	r="speed"
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	rDomain={[0, 14]}
	rRange={[2, 16]}
	padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	{#snippet children({ context })}
		<Layer
			onpointermove={(e) => {
				const x = e.offsetX - context.padding.left;
				const y = e.offsetY - context.padding.top;
				mouseX = context.xScale.invert?.(x) ?? x;
				mouseY = context.yScale.invert?.(y) ?? y;
			}}
		>
			<Axis placement="bottom" rule />
			<Axis placement="left" rule />
			<Vector
				data={data.map((d) => {
					const dx = mouseX - d.x;
					const dy = mouseY - d.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					return {
						...d,
						direction: Math.atan2(dx, dy) * (180 / Math.PI),
						speed: Math.min(dist / 5, 14)
					};
				})}
				x="x"
				y="y"
				length="speed"
				rotate="direction"
				class="stroke-primary"
			/>
		</Layer>
	{/snippet}
</Chart>
