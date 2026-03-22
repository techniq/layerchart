<script lang="ts">
	import { Chart, Vector, Layer } from 'layerchart';

	const cols = 24;
	const rows = 16;

	const data = Array.from({ length: cols * rows }, (_, i) => {
		const col = i % cols;
		const row = Math.floor(i / cols);
		const x = (col + 0.5) / cols * 100;
		const y = (row + 0.5) / rows * 100;
		// Simulate a flow field with a circular pattern
		const angle = Math.atan2(y - 50, x - 50) * (180 / Math.PI) + 90;
		const dist = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
		const speed = Math.min(dist / 50, 1) * 8 + 2;
		return { x, y, speed, angle };
	});
</script>

<Chart
	{data}
	x="x"
	y="y"
	r="speed"
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	rRange={[4, 12]}
	padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
	height={300}
>
	<Layer>
		<Vector x="x" y="y" length="speed" rotate="angle" class="stroke-primary" />
	</Layer>
</Chart>
