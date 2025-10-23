<script lang="ts">
	import { Chart, Group, Layer, Polygon } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let cornerRadius = $state(0);

	const data = undefined;
	export { data };
</script>

<div class="flex gap-2 mb-2">
	<RangeField label="cornerRadius" labelPlacement="left" bind:value={cornerRadius} max={50} />
</div>

<div class="grid grid-cols-sm gap-3">
	<div>
		<h3>Arrow</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Group x={context.width / 2} y={context.height / 2}>
						{@const size = 60}
						<Polygon
							points={[
								{ x: size, y: 0 },
								{ x: size / 4, y: -size / 2 },
								{ x: size / 4, y: -size / 4 },
								{ x: -size, y: -size / 4 },
								{ x: -size, y: size / 4 },
								{ x: size / 4, y: size / 4 },
								{ x: size / 4, y: size / 2 },
								{ x: size, y: 0 }
							]}
							{cornerRadius}
						/>
					</Group>
				</Layer>
			{/snippet}
		</Chart>
	</div>

	<div>
		<h3>Cross</h3>
		<Chart height={150}>
			{#snippet children({ context })}
				<Layer>
					<Group x={context.width / 2} y={context.height / 2}>
						{@const size = 50}
						<Polygon
							points={[
								{ x: -size, y: -size / 3 },
								{ x: -size / 3, y: -size / 3 },
								{ x: -size / 3, y: -size },
								{ x: size / 3, y: -size },
								{ x: size / 3, y: -size / 3 },
								{ x: size, y: -size / 3 },
								{ x: size, y: size / 3 },
								{ x: size / 3, y: size / 3 },
								{ x: size / 3, y: size },
								{ x: -size / 3, y: size },
								{ x: -size / 3, y: size / 3 },
								{ x: -size, y: size / 3 }
							]}
							{cornerRadius}
						/>
					</Group>
				</Layer>
			{/snippet}
		</Chart>
	</div>
</div>
