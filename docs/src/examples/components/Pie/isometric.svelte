<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { cubicInOut } from 'svelte/easing';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { Arc, ArcLabel, Chart, Layer, Pie, Tooltip } from 'layerchart';

	const data = [
		{ fruit: 'Bananas', count: 8 },
		{ fruit: 'Kiwi', count: 3 },
		{ fruit: 'Mixed nuts', count: 1 },
		{ fruit: 'Oranges', count: 6 },
		{ fruit: 'Apples', count: 8 },
		{ fruit: 'Pears', count: 4 },
		{ fruit: 'Clementines', count: 4 },
		{ fruit: 'Reddish (bag)', count: 1 },
		{ fruit: 'Grapes (bunch)', count: 1 }
	];
	export { data };

	let shape = $state<'pie' | 'donut'>('pie');
	let view = $state<'flat' | 'isometric'>('isometric');
</script>

<div class="flex flex-wrap gap-2">
	<Field label="View">
		<ToggleGroup bind:value={view} variant="outline">
			<ToggleOption value="flat">Flat</ToggleOption>
			<ToggleOption value="isometric">Isometric</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Shape">
		<ToggleGroup bind:value={shape} variant="outline">
			<ToggleOption value="pie">Pie</ToggleOption>
			<ToggleOption value="donut">Donut</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<!-- Every slice stood up 40px, drawn back to front — drag to turn it.  `zRange` leaves room
     above the floor for them -->
<Chart
	{data}
	x="count"
	c="fruit"
	cScale={scaleOrdinal()}
	cRange={schemeTableau10}
	zRange={[0, 40]}
	isometric={{
		rotate: 10, // improves label position
		tilt: view === 'flat' ? 0 : 55,
		motion: { type: 'tween', duration: 800, easing: cubicInOut }
	}}
	transform={{ mode: 'canvas', drag: 'rotate' }}
	padding={{ top: 24, bottom: 24, left: 120, right: 120 }}
	height={400}
>
	{#snippet children({ context })}
		<Layer center>
			<Pie z={40} sort={null}>
				{#snippet children({ arcs })}
					<!-- Back to front, each slice with its callout -->
					{#each arcs as arc}
						<Arc
							startAngle={arc.startAngle}
							endAngle={arc.endAngle}
							padAngle={arc.padAngle}
							innerRadius={shape === 'donut' ? 0.5 : 0}
							z={40}
							fill={context.cScale?.(arc.data.fruit)}
							data={arc.data}
							tooltip
						>
							{#snippet children({
								centroid,
								startAngle,
								endAngle,
								innerRadius,
								outerRadius,
								getArcTextProps
							})}
								<!-- Off the top of the slices behind, below the slices in front — facing the viewer -->
								<ArcLabel
									{centroid}
									{startAngle}
									{endAngle}
									{innerRadius}
									{outerRadius}
									{getArcTextProps}
									placement="callout"
									value={arc.data.fruit}
									z={40}
									viewport
									line={{ class: 'stroke-surface-content/50' }}
									class="fill-surface-content text-xs"
								/>
							{/snippet}
						</Arc>
					{/each}
				{/snippet}
			</Pie>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.fruit}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="count" value={data.count} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
