<script lang="ts">
	import { Chart, Vector, Circle, Axis, Layer } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let rotate = $state(45);
</script>

<div class="mb-2 screenshot-hidden">
	<RangeField label="Rotate" bind:value={rotate} min={0} max={360} step={1} />
</div>

<Chart
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />

		<!-- anchor="start": base at position -->
		<Circle cx={100} cy={150} r={3} class="fill-primary" />
		<Vector x={100} y={150} length={40} width={5} {rotate} anchor="start" class="stroke-primary" />

		<!-- anchor="middle": center at position (default for arrow) -->
		<Circle cx={200} cy={150} r={3} class="fill-secondary" />
		<Vector
			x={200}
			y={150}
			length={40}
			width={5}
			{rotate}
			anchor="middle"
			class="stroke-secondary"
		/>

		<!-- anchor="end": tip at position -->
		<Circle cx={300} cy={150} r={3} class="fill-danger" />
		<Vector x={300} y={150} length={40} width={5} {rotate} anchor="end" class="stroke-danger" />
	</Layer>
</Chart>
