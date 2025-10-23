<script lang="ts">
	import { Axis, Chart, Circle, Point, Layer } from 'layerchart';

	let data: Array<{ x: number; y: number }> = [];
	export { data };
</script>

<Chart
	{data}
	x={(d) => d.x}
	y={(d) => d.y}
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />

		<Point d={{ x: 50, y: 50 }}>
			{#snippet children({ x, y })}
				<Circle cx={x} cy={y} r={10} />
			{/snippet}
		</Point>

		<Point d={{ x: 20, y: 20 }}>
			{#snippet children({ x, y })}
				<Circle cx={x} cy={y} r={15} class="fill-primary bg-primary" />
			{/snippet}
		</Point>
	</Layer>
</Chart>
