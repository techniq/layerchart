<script lang="ts">
	import { Area, Axis, Chart, Group, Layer, Text } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { curveBasis } from 'd3-shape';
	import { max, mean, range } from 'd3-array';
	import { Field, RangeField, Switch } from 'svelte-ux';

	let overlap = $state(4);
	let height = $state(500);
	let opaque = $state(true);

	const categories = [
		'Almost Certainly',
		'Highly Likely',
		'Very Good Chance',
		'Probable',
		'Likely',
		'Probably',
		'We Believe',
		'Better Than Even',
		'About Even',
		'We Doubt',
		'Improbable',
		'Unlikely',
		'Probably Not',
		'Little Chance',
		'Almost No Chance',
		'Highly Unlikely',
		'Chances Are Slight'
	];

	// Raw survey data: 46 respondents rated each phrase on a 0-100 probability scale
	const rawData: Record<string, number[]> = {
		'Almost Certainly': [
			95, 95, 95, 95, 98, 97, 95, 97, 95, 90, 99, 95, 99, 90, 95, 80, 99, 95, 95, 99, 95, 97, 90,
			99, 99, 95, 93, 95, 99, 99, 90, 95, 99, 90, 95, 95, 95, 99, 95, 97, 95, 95, 99, 95, 95, 95
		],
		'Highly Likely': [
			80, 75, 85, 85, 95, 90, 90, 85, 80, 80, 95, 85, 95, 80, 85, 75, 90, 95, 80, 95, 90, 90, 85,
			99, 90, 85, 80, 90, 90, 95, 80, 80, 90, 85, 85, 80, 90, 85, 85, 95, 80, 80, 85, 90, 85, 80
		],
		'Very Good Chance': [
			85, 75, 85, 85, 80, 85, 85, 75, 85, 80, 90, 85, 90, 80, 85, 75, 85, 80, 80, 90, 85, 85, 80,
			95, 85, 85, 75, 85, 85, 90, 80, 85, 85, 80, 85, 80, 85, 80, 85, 90, 85, 80, 80, 85, 85, 80
		],
		Probable: [
			75, 51, 70, 70, 70, 70, 75, 60, 75, 65, 80, 70, 85, 65, 70, 60, 75, 70, 70, 80, 75, 70, 70,
			90, 75, 70, 60, 75, 75, 80, 70, 70, 70, 65, 70, 70, 75, 70, 70, 80, 75, 65, 70, 70, 70, 65
		],
		Likely: [
			66, 75, 75, 75, 70, 70, 70, 60, 65, 60, 80, 70, 85, 65, 60, 55, 80, 70, 65, 80, 70, 70, 65,
			85, 75, 70, 60, 70, 65, 80, 70, 65, 65, 60, 65, 60, 70, 65, 65, 75, 70, 60, 70, 65, 65, 60
		],
		Probably: [
			75, 51, 70, 70, 75, 70, 70, 55, 65, 60, 70, 65, 80, 60, 60, 50, 70, 60, 60, 75, 65, 65, 60,
			80, 70, 65, 55, 65, 60, 70, 60, 60, 60, 55, 60, 60, 65, 60, 60, 70, 65, 55, 60, 60, 60, 55
		],
		'We Believe': [
			66, 51, 80, 80, 65, 60, 60, 55, 55, 50, 60, 55, 70, 50, 50, 40, 60, 50, 50, 65, 55, 50, 50,
			70, 60, 55, 45, 55, 50, 60, 50, 50, 50, 45, 50, 50, 55, 50, 50, 60, 55, 45, 50, 55, 50, 45
		],
		'Better Than Even': [
			55, 51, 60, 60, 60, 55, 55, 50, 55, 50, 60, 55, 65, 50, 55, 45, 60, 55, 55, 60, 55, 55, 50,
			65, 55, 55, 50, 55, 55, 60, 55, 55, 55, 50, 55, 50, 55, 50, 55, 60, 55, 50, 55, 55, 55, 50
		],
		'About Even': [
			50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
			50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50
		],
		'We Doubt': [
			40, 20, 30, 30, 10, 20, 30, 25, 20, 20, 20, 25, 20, 20, 30, 30, 20, 15, 20, 15, 20, 20, 20,
			15, 20, 20, 25, 20, 20, 15, 20, 25, 20, 20, 20, 20, 20, 20, 20, 20, 20, 25, 20, 20, 20, 20
		],
		Improbable: [
			20, 49, 10, 10, 50, 15, 15, 20, 15, 15, 10, 15, 10, 15, 10, 20, 10, 10, 15, 5, 10, 15, 15, 5,
			10, 15, 20, 10, 10, 5, 10, 15, 10, 15, 10, 15, 10, 10, 15, 10, 10, 20, 15, 10, 10, 15
		],
		Unlikely: [
			30, 25, 25, 25, 5, 20, 20, 15, 20, 15, 15, 15, 15, 15, 25, 25, 15, 10, 15, 10, 15, 15, 15, 5,
			15, 20, 20, 15, 15, 10, 15, 20, 15, 15, 20, 15, 20, 15, 15, 10, 15, 20, 15, 20, 15, 15
		],
		'Probably Not': [
			15, 49, 25, 25, 20, 20, 20, 15, 20, 15, 15, 15, 15, 15, 20, 25, 15, 10, 15, 10, 15, 15, 15, 5,
			15, 15, 20, 15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 15, 15, 15
		],
		'Little Chance': [
			20, 5, 20, 20, 5, 10, 10, 10, 10, 10, 5, 10, 5, 10, 10, 15, 5, 5, 10, 5, 10, 10, 10, 2, 10,
			10, 10, 10, 10, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 5, 10, 10, 10, 10, 10, 10
		],
		'Almost No Chance': [
			5, 5, 1, 1, 1, 5, 2, 5, 2, 2, 1, 2, 1, 2, 5, 10, 1, 2, 2, 1, 2, 2, 2, 1, 2, 5, 5, 2, 2, 1, 2,
			5, 2, 2, 2, 5, 5, 2, 2, 1, 2, 5, 2, 5, 2, 5
		],
		'Highly Unlikely': [
			25, 10, 5, 5, 2, 5, 5, 5, 5, 5, 2, 5, 2, 5, 5, 10, 2, 3, 5, 1, 5, 5, 5, 1, 5, 5, 5, 5, 5, 2,
			5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 5, 5, 5, 5, 5, 5
		],
		'Chances Are Slight': [
			25, 5, 15, 15, 10, 10, 10, 10, 10, 10, 5, 10, 5, 10, 10, 15, 5, 5, 10, 5, 10, 10, 10, 2, 10,
			10, 10, 10, 10, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 5, 10, 10, 10, 10, 10, 10
		]
	};

	// Epanechnikov kernel for KDE
	function epanechnikov(bandwidth: number) {
		return (v: number) => (Math.abs((v /= bandwidth)) <= 1 ? (0.75 * (1 - v * v)) / bandwidth : 0);
	}

	// Kernel density estimator
	function kde(kernel: (v: number) => number, thresholds: number[], data: number[]) {
		return thresholds.map((t) => ({
			x: t,
			value: mean(data, (d) => kernel(t - d)) ?? 0
		}));
	}

	const N = categories.length;
	const basePadding = { top: 20, bottom: 30, left: 140, right: 10 };
	const thresholds = range(0, 101, 2); // 0 to 100 in steps of 2
	const bandwidth = 7;

	// Compute KDE for each category
	const seriesData = categories.map((name) => ({
		name,
		values: kde(epanechnikov(bandwidth), thresholds, rawData[name])
	}));

	const maxDensity = max(seriesData.flatMap((s) => s.values.map((d) => d.value))) ?? 0.01;

	const overlapExtra = $derived(Math.max(0, overlap - 1));
	const paddingTop = $derived(
		(N * basePadding.top + overlapExtra * (height - basePadding.bottom)) / (N + overlapExtra)
	);
	const padding = $derived({
		...basePadding,
		top: paddingTop
	});

	const innerHeight = $derived(height - paddingTop - basePadding.bottom);
	const step = $derived(innerHeight / N);

	const zScale = $derived(
		scaleLinear()
			.domain([0, maxDensity])
			.range([0, -overlap * step])
	);

	export { seriesData as data };
</script>

<div class="flex gap-4 mb-4">
	<RangeField label="Overlap" bind:value={overlap} min={1} max={12} step={0.5} />
	<RangeField label="Height" bind:value={height} min={300} max={800} step={50} />
	<Field label="Opaque" let:id>
		<Switch {id} bind:checked={opaque} size="md" />
	</Field>
</div>

<Chart
	data={seriesData[0].values}
	x="x"
	y="value"
	yDomain={[0, innerHeight]}
	yRange={({ height }) => [0, height]}
	{padding}
	{height}
>
	<Layer>
		{#each seriesData as series, i (series.name)}
			{@const rowY = step + i * step}
			<Group y={rowY}>
				<Area
					data={series.values}
					y0={() => 0}
					y1={(d) => zScale(d.value)}
					curve={curveBasis}
					class={opaque ? 'fill-primary-200 dark:fill-primary-900' : 'fill-primary/20'}
					line={{ class: 'stroke-primary stroke-1' }}
				/>
			</Group>
		{/each}

		{#each categories as name, i (name)}
			{@const rowY = step + i * step}
			<Text
				value={name}
				x={-8}
				y={rowY}
				textAnchor="end"
				verticalAnchor="middle"
				class="text-xs fill-surface-content/60"
			/>
		{/each}

		<Axis placement="bottom" rule />
	</Layer>
</Chart>
