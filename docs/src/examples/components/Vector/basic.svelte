<script lang="ts">
	import { Chart, Vector, Layer } from 'layerchart';

	function circle(centerX: number, centerY: number, rotate: (angle: number) => number) {
		return Array.from({ length: 12 }, (_, i) => {
			const angle = i * 30;
			const rad = (angle * Math.PI) / 180;
			return {
				cx: centerX + Math.sin(rad) * 60,
				cy: centerY - Math.cos(rad) * 60,
				rotate: rotate(angle)
			};
		});
	}

	const outward = circle(120, 150, (a) => a);
	const inward = circle(320, 150, (a) => a + 180);
</script>

<Chart padding={{ top: 10, bottom: 10, left: 10, right: 10 }} height={300}>
	<Layer>
		{#each outward as v}
			<Vector x={v.cx} y={v.cy} length={30} width={5} rotate={v.rotate} class="stroke-primary" />
		{/each}
		{#each inward as v}
			<Vector x={v.cx} y={v.cy} length={30} width={5} rotate={v.rotate} class="stroke-danger" />
		{/each}
	</Layer>
</Chart>
