<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { randomUniform } from 'd3-random';
	import { forceX, forceY, forceManyBody, forceCollide, type SimulationNodeDatum } from 'd3-force';

	import { Chart, Circle, Group, ForceSimulation, Layer } from 'layerchart';
	import type { Prettify } from '@layerstack/utils';

	type NodeDatum = { r: number; group: number };
	type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;

	const k = 600 / 200;
	const r = randomUniform(k, k * 4);
	const n = 4;
	const data: MySimulationNodeDatum[] = Array.from({ length: 200 }, (_, i) => ({
		r: r(),
		group: i && (i % n) + 1
	}));

	const groupColor = scaleOrdinal([
		'var(--color-info)',
		'var(--color-warning)',
		'var(--color-danger)'
	]);

	const xForce = forceX<MySimulationNodeDatum>().strength(0.01);
	const yForce = forceY<MySimulationNodeDatum>().strength(0.01);
	const collideForce = forceCollide<MySimulationNodeDatum>()
		.radius((d) => d.r + 1)
		.iterations(3);
	const manyBodyForce = forceManyBody<MySimulationNodeDatum>();

	export { data };
</script>

<Chart height={600}>
	{#snippet children({ context })}
		<ForceSimulation
			forces={{
				x: xForce,
				y: yForce,
				collide: collideForce,
				charge: manyBodyForce.strength((d, i) => (i ? 0 : (-context.width * 2) / 3))
			}}
			data={{ nodes: data }}
			alphaTarget={0.3}
			velocityDecay={0.1}
		>
			{#snippet children({ nodes, simulation })}
				<Layer
					onpointermove={(e) => {
						simulation.nodes()[0].fx = e.offsetX - context.width / 2;
						simulation.nodes()[0].fy = e.offsetY - context.height / 2;
					}}
				>
					<Group center>
						{#each nodes as node, i}
							{#if i > 0}
								<Circle
									cx={node.x}
									cy={node.y}
									r={node.r}
									fill={groupColor(node.group.toString())}
								/>
							{/if}
						{/each}
					</Group>
				</Layer>
			{/snippet}
		</ForceSimulation>
	{/snippet}
</Chart>
