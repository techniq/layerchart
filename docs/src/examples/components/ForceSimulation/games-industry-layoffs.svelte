<script module lang="ts">
	import { getGamesLayoffs } from '$lib/data.remote';
	const data = await getGamesLayoffs();
</script>

<script lang="ts">
	import { scaleSqrt } from 'd3-scale';
	import { forceX, forceY, forceCollide, type SimulationNodeDatum } from 'd3-force';

	import { asAny, Axis, Chart, Circle, Layer, Text, Tooltip } from 'layerchart';
	import { ForceSimulation } from 'layerchart/force';

	import type { GamesLayoff } from '$lib/data.remote';

	type Node = GamesLayoff & SimulationNodeDatum & { r: number };

	// Colors mirror the original Observable notebook (yellow→orange→red as years progress).
	const yearColor: Record<number, string> = {
		2022: '#facc42',
		2023: '#f09855',
		2024: '#e74e45'
	};
	const unknownColor = '#cccccc';

	const radiusScale = scaleSqrt().domain([0, 5000]).range([4, 28]);

	const labelThreshold = 500;

	const nodes: Node[] = $derived(
		data.map((d) => ({
			...d,
			r: d.headcount != null ? radiusScale(d.headcount) : 6
		}))
	);

	const xForce = forceX<Node>().strength(0.95);
	const yForce = forceY<Node>().strength(0.06);
	const collideForce = forceCollide<Node>().radius((d) => d.r + 1);
</script>

<Chart {data} x="date" xNice padding={{ top: 12, bottom: 28, left: 12, right: 12 }} height={420}>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="bottom" rule grid format={(d: Date) => d.getUTCFullYear().toString()} />
			<ForceSimulation
				forces={{
					x: xForce.x((d) => context.xGet(asAny(d))),
					y: yForce.y(context.height / 2),
					collide: collideForce
				}}
				data={{ nodes }}
			>
				{#snippet children({ nodes })}
					{#each nodes as node, index (index)}
						{@const year = node.date.getUTCFullYear()}
						{@const color =
							node.headcount == null ? unknownColor : (yearColor[year] ?? unknownColor)}
						<Circle
							cx={node.x}
							cy={node.y}
							r={node.r}
							fill={color}
							fillOpacity={node.headcount == null ? 0.5 : 1}
							stroke="var(--color-surface-100)"
							onpointermove={(e) => context.tooltip.show(e, node)}
							onpointerleave={context.tooltip.hide}
						/>
					{/each}
					{#each nodes.filter((n) => n.headcount != null && n.headcount >= labelThreshold) as node, index (index)}
						<Text
							x={node.x}
							y={node.y}
							value={node.studio}
							textAnchor="middle"
							verticalAnchor="middle"
							fontSize={Math.min(11, node.r * 0.6)}
							stroke="var(--color-surface-100)"
							strokeWidth={2}
							class="pointer-events-none"
						/>
					{/each}
				{/snippet}
			</ForceSimulation>
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.studio}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Date" value={data.date} format="day" />
					{#if data.headcount != null}
						<Tooltip.Item label="Headcount" value={data.headcount} format="integer" />
					{:else}
						<Tooltip.Item label="Headcount" value="Unknown" />
					{/if}
					{#if data.parent}
						<Tooltip.Item label="Parent" value={data.parent} />
					{/if}
					{#if data.type}
						<Tooltip.Item label="Type" value={data.type} />
					{/if}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
