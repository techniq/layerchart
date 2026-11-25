<script lang="ts">
	import { geoIdentity, geoPath, type GeoProjection } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, Circle, Ellipse, Layer, Rect, Text, shapeLabel } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';
	import { getUsCountiesAlbersTopology } from '$lib/geo.remote';

	// Already projected (to 975 × 610 px), so `shapeLabel()` measures the shapes as they're drawn
	const topology = $derived(await getUsCountiesAlbersTopology());
	const states = $derived(feature(topology, topology.objects.states));

	let fit = $state<'circle' | 'rect'>('circle');
	let aspect = $state(2);
	let centroidWeight = $state(0);

	/** Each state's label position, and the room found there */
	const labels = $derived(
		states.features.map((state) => {
			const { geometry } = state;
			const polygons =
				geometry.type === 'MultiPolygon'
					? geometry.coordinates
					: geometry.type === 'Polygon'
						? [geometry.coordinates]
						: [];
			return {
				name: state.properties.name,
				centroid: geoPath().centroid(state),
				...shapeLabel(polygons as [number, number][][][], { fit, aspect, centroidWeight })
			};
		})
	);

	const data = $derived(topology);
	export { data };
</script>

<div class="grid grid-cols-[auto_1fr_1fr] gap-3 mb-2">
	<Field label="Fit">
		<ToggleGroup bind:value={fit} variant="outline" size="sm">
			<ToggleOption value="circle">Circle</ToggleOption>
			<ToggleOption value="rect">Rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField label="Aspect" bind:value={aspect} min={1} max={5} step={0.25} />
	<RangeField label="Centroid weight" bind:value={centroidWeight} min={0} max={1} step={0.05} />
</div>

<Chart
	geo={{ projection: geoIdentity as unknown as () => GeoProjection, fitGeojson: states }}
	height={500}
>
	{#snippet children({ context })}
		{@const projection = context.geo.projection}
		<!-- `geoIdentity` only scales and translates, so the room scales by its zoom -->
		{@const k = projection?.scale() ?? 1}
		<Layer>
			{#each states.features as state (state.id)}
				<GeoPath geojson={state} class="fill-surface-content/5 stroke-surface-content/30" />
			{/each}

			{#each labels as label (label.name)}
				{@const [x, y] = projection?.([label.x, label.y]) ?? [label.x, label.y]}
				{@const rx = label.distance * k}
				{@const ry = (label.distance / aspect) * k}
				<!-- The room at the label's position: the largest ellipse (or rect) of `aspect` that fits -->
				{#if fit === 'circle'}
					<Ellipse cx={x} cy={y} {rx} {ry} class="fill-warning/40 stroke-warning" />
				{:else}
					<Rect
						x={x - rx}
						y={y - ry}
						width={2 * rx}
						height={2 * ry}
						class="fill-warning/40 stroke-warning"
					/>
				{/if}
			{/each}

			<!-- Each state's centroid, which `centroidWeight` pulls the label towards -->
			{#each labels as label (label.name)}
				{@const [cx, cy] = projection?.(label.centroid) ?? label.centroid}
				<Circle {cx} {cy} r={2} class="fill-surface-content/40" />
			{/each}

			{#each labels as label (label.name)}
				{@const [x, y] = projection?.([label.x, label.y]) ?? [label.x, label.y]}
				<Text
					{x}
					{y}
					value={label.name}
					textAnchor="middle"
					verticalAnchor="middle"
					class="text-[9px] fill-surface-content pointer-events-none"
				/>
			{/each}
		</Layer>
	{/snippet}
</Chart>
