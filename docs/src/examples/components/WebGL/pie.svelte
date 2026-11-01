<script lang="ts">
	import { pie } from 'd3-shape';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { Arc, Chart, WebGL, Text, Tooltip, perspective } from '@layerchart/webgl';

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

	const arcs = pie<(typeof data)[number]>()
		.value((d) => d.count)
		.sort(null)(data);
</script>

<Field label="Shape" class="w-fit">
	<ToggleGroup bind:value={shape} variant="outline">
		<ToggleOption value="pie">Pie</ToggleOption>
		<ToggleOption value="donut">Donut</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Each slice stands 40px tall.  Drag to turn it -->
<Chart
	view={perspective({ rotate: 10, tilt: 55 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	c="fruit"
	cScale={scaleOrdinal()}
	cRange={schemeTableau10}
	zRange={[0, 40]}
	tooltipContext
	padding={{ left: 80, right: 80 }}
	height={400}
	class="cursor-grab active:cursor-grabbing"
>
	{#snippet children({ context })}
		{@const outer = Math.min(context.width, context.height) / 2}
		<WebGL>
			<Arc
				tooltip
				data={arcs}
				innerRadius={shape === 'donut' ? outer * 0.5 : 0}
				outerRadius={outer}
				z={40}
				fill={(arc) => context.cScale?.(arc.data.fruit)}
			/>
			<!-- Labels beyond each slice's outer edge, at its middle angle -->
			<Text
				data={arcs}
				x={(arc) =>
					context.width / 2 + Math.sin((arc.startAngle + arc.endAngle) / 2) * outer * 1.18}
				y={(arc) =>
					context.height / 2 - Math.cos((arc.startAngle + arc.endAngle) / 2) * outer * 1.18}
				z={40}
				value={(arc) => arc.data.fruit}
				class="text-xs text-surface-content"
			/>
		</WebGL>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.data.fruit}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="count" value={data.data.count} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
