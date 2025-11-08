<script lang="ts">
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import {
		forceX,
		forceManyBody,
		forceCollide,
		forceCenter,
		type SimulationNodeDatum
	} from 'd3-force';

	import { asAny, Chart, Circle, ForceSimulation, Layer } from 'layerchart';
	import GroupControl from '$lib/components/GroupControl.svelte';
	import { getForceGroupDots } from '$lib/data.remote';

	import type { Prettify } from '@layerstack/utils';
	type NodeDatum = { category: string; value: number };
	type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;

	const data: MySimulationNodeDatum[] = await getForceGroupDots();
	const nodes: MySimulationNodeDatum[] = data;

	const categoryColor = scaleOrdinal([
		'var(--color-info)',
		'var(--color-warning)',
		'var(--color-danger)'
	]);
	let alpha = $state(1);

	let groupBy = $state(true);

	$effect.pre(() => {
		reheatSimulation({ groupBy });
	});

	const xForce = forceX<MySimulationNodeDatum>().strength(0.1);
	const chargeForce = forceManyBody<MySimulationNodeDatum>().strength(3);
	const collideForce = forceCollide<MySimulationNodeDatum>();
	const centerForce = forceCenter<MySimulationNodeDatum>();

	function reheatSimulation(args: Record<string, any> = {}) {
		const _ = args;
		alpha = 1.0;
	}

	export { data };
</script>

<GroupControl bind:groupBy />
<Chart data={nodes} x="category" xScale={scaleBand()} r="value" rRange={[3, 12]} height={300}>
	{#snippet children({ context })}
		{@const nodeStrokeWidth = 1}
		<Layer>
			<ForceSimulation
				forces={{
					x: xForce.x((d) =>
						groupBy
							? context.xGet(asAny(d)) + (context.xScale.bandwidth?.() ?? 0) / 2
							: context.width / 2
					),
					charge: chargeForce,
					collide: collideForce.radius(
						(d) => context.rGet(asAny(d)) + nodeStrokeWidth / 2 // Divide this by two because an svg stroke is drawn halfway out
					),
					center: centerForce.x(context.width / 2).y(context.height / 2)
				}}
				data={{ nodes }}
				bind:alpha
			>
				{#snippet children({ nodes })}
					{#each nodes as node}
						<Circle
							cx={node.x}
							cy={node.y}
							r={context.rGet(node)}
							fill={categoryColor(node.category)}
							class="stroke-surface-100"
						/>
					{/each}
				{/snippet}
			</ForceSimulation>
		</Layer>
	{/snippet}
</Chart>
