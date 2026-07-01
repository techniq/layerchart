<script module lang="ts">
	import { getLayoffs, type Layoff } from '$lib/data.remote';
	const all = await getLayoffs();
</script>

<script lang="ts">
	import { rollups, sum } from 'd3-array';
	import { scaleBand } from 'd3-scale';
	import { interpolateYlOrRd, schemeBuGn, schemeGnBu, schemeSpectral } from 'd3-scale-chromatic';
	import { forceX, forceY, forceCollide, type SimulationNodeDatum } from 'd3-force';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { asAny, Axis, Chart, Circle, Layer, Tooltip } from 'layerchart';
	import { ForceSimulation } from 'layerchart/force';

	type Node = Layoff & SimulationNodeDatum & { totalLaidOff: number; year: number };

	let splitByYear = $state(true);
	let alpha = $state(1);

	// Reheat the simulation when the layout toggles so it animates to the new targets.
	$effect.pre(() => {
		void splitByYear;
		alpha = 1;
	});

	// Limit to events with a known headcount and the top industries (by total layoffs).
	const data = $derived.by(() => {
		const known = all.filter(
			(d): d is Layoff & { totalLaidOff: number } =>
				d.totalLaidOff != null && d.totalLaidOff > 0 && !!d.industry
		);
		const totals = rollups(
			known,
			(rows) => sum(rows, (d) => d.totalLaidOff),
			(d) => d.industry
		).sort((a, b) => b[1] - a[1]);
		const topIndustries = new Set(totals.slice(0, 10).map(([industry]) => industry));
		return known
			.filter((d) => topIndustries.has(d.industry))
			.map((d): Node => ({ ...d, year: d.date.getUTCFullYear() }));
	});

	const industries = $derived(
		Array.from(new Set(data.map((d) => d.industry))).sort((a, b) => a.localeCompare(b))
	);

	const years = $derived(Array.from(new Set(data.map((d) => d.year))).sort((a, b) => a - b));

	// Sequential YlOrRd palette across the year range (oldest = pale, newest = red).
	const yearColors = $derived(
		years.map((_, i) => interpolateYlOrRd(0.25 + (0.7 * i) / Math.max(years.length - 1, 1)))
	);

	const xForce = forceX<Node>();
	const yForce = forceY<Node>();
	const collideForce = forceCollide<Node>();
</script>

<div class="flex justify-end mb-4 screenshot-hidden">
	<Field labelPlacement="left" class="mb-1" dense>
		<ToggleGroup bind:value={splitByYear} size="sm">
			<ToggleOption value={true}>Split by year</ToggleOption>
			<ToggleOption value={false}>All years</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	{data}
	x="industry"
	xDomain={industries}
	y="year"
	yScale={scaleBand()}
	r="totalLaidOff"
	rRange={[2, 14]}
	c="year"
	cDomain={years}
	cRange={[
		'var(--color-orange-800)',
		'var(--color-orange-700)',
		'var(--color-orange-600)',
		'var(--color-orange-500)',
		'var(--color-orange-400)',
		'var(--color-orange-300)',
		'var(--color-orange-200)',
		'var(--color-orange-100)'
	]}
	padding={{ top: 12, bottom: 28, left: 28, right: 12 }}
	height={splitByYear ? Math.max(400, years.length * 90) : 400}
>
	{#snippet children({ context })}
		{@const xBandwidth = context.xScale.bandwidth?.() ?? 0}
		{@const yBandwidth = context.yScale.bandwidth?.() ?? 0}

		<Layer>
			<Axis placement="top" />
			{#if splitByYear}
				<Axis placement="left" />
			{/if}

			<ForceSimulation
				forces={{
					x: xForce.x((d) => context.xGet(asAny(d)) + xBandwidth / 2),
					// Use the chart's yScale directly so axis labels and bubble
					// positions stay in lockstep regardless of band domain order.
					y: yForce.y((d) =>
						splitByYear ? Number(context.yGet(asAny(d))) + yBandwidth / 2 : context.height / 2
					),
					collide: collideForce.radius((d) => Number(context.rGet(asAny(d))) + 1)
				}}
				data={{ nodes: data as Node[] }}
				bind:alpha
			>
				{#snippet children({ nodes })}
					{#each nodes as node, index (index)}
						<Circle
							cx={node.x}
							cy={node.y}
							r={Number(context.rGet(node))}
							fill={context.cScale?.(node.year)}
							fillOpacity={0.5}
							stroke="none"
							onpointermove={(e) => context.tooltip.show(e, node)}
							onpointerleave={context.tooltip.hide}
						/>
					{/each}
				{/snippet}
			</ForceSimulation>
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.company}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Date" value={data.date} format="day" />
					<Tooltip.Item label="Laid off" value={data.totalLaidOff} format="integer" />
					<Tooltip.Item label="Industry" value={data.industry} />
					<Tooltip.Item label="Location" value={data.location} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
