<script lang="ts">
	import { Chart, Layer, Polygon } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let rotate = $state(0);
	let cornerRadius = $state(0);

	const data = undefined;
	export { data };
</script>

<div class="flex gap-2 mb-2">
	<RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
	<RangeField label="cornerRadius" labelPlacement="left" bind:value={cornerRadius} max={50} />
</div>

<div class="grid grid-cols-sm gap-3">
	<div class="outline rounded-md p-2">
		<h3>Triangle</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={3}
						{rotate}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Square</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={4}
						rotate={rotate + 45}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Rectangle</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={4}
						scaleX={1.5}
						rotate={rotate + 45}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Diamond</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={4}
						scaleX={0.5}
						{rotate}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Rhombus</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={4}
						skewX={-20}
						rotate={rotate + 45}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Parallelogram</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={4}
						skewX={-20}
						scaleX={1.5}
						rotate={rotate + 45}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Trapezoid</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={4}
						tiltX={-1}
						rotate={rotate + 45}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Pentagon</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={5}
						{rotate}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Hexagon</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={6}
						{rotate}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div class="outline rounded-md p-2">
		<h3>Octagon</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Polygon
						cx={context.width / 2}
						cy={context.height / 2}
						r={60}
						points={8}
						{rotate}
						{cornerRadius}
					/>
				</Layer>
			{/snippet}
		</Chart>
	</div>
</div>
