<script lang="ts">
	import {
		forceCollide,
		forceManyBody,
		forceLink,
		forceCenter,
		type SimulationNodeDatum,
		type SimulationLinkDatum
	} from 'd3-force';
	import { curveLinear } from 'd3-shape';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeCategory10 } from 'd3-scale-chromatic';

	import { Chart, Circle, ForceSimulation, Link, Layer, Tooltip } from 'layerchart';
	import ForceGraphControls from '$lib/components/controls/ForceGraphPlaygroundControls.svelte';
	import { getMiserablesGraph } from '$lib/graph.remote';

	import type { Prettify } from '@layerstack/utils';
	type NodeDatum = {
		id: string;
		group: number;
	};

	type LinkDatum = {
		source: string;
		target: string;
		value: number;
	};

	type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;
	type MySimulationLinkDatum = Prettify<
		LinkDatum & SimulationLinkDatum<NodeDatum & SimulationNodeDatum>
	>;

	const data = await getMiserablesGraph();

	const nodes: MySimulationNodeDatum[] = data.nodes;
	const links: MySimulationLinkDatum[] = data.links;

	const colorScale = scaleOrdinal(schemeCategory10);

	let config = $state({
		isStopped: false,
		isStatic: false,
		alpha: 1,
		alphaTarget: 0,
		running: false,
		nodeRadius: 3,
		nodeStrokeWidth: 0,
		linkWidth: 1,
		linkOpacity: 0.5,
		hasLinkForce: true,
		hasChargeForce: true,
		hasCollideForce: true,
		hasCenterForce: true,
		linkDistance: 30,
		chargeDistanceMin: 1,
		chargeDistanceMax: 1000,
		chargeStrength: -30,
		collideRadius: 3,
		collideStrength: 1,
		centerStrength: 1.0
	});

	// Separate alpha variable for binding to ForceSimulation
	let alpha = $state(1);

	// Sync alpha with config.alpha (both ways)
	$effect(() => {
		if (alpha !== config.alpha) {
			config.alpha = alpha;
		}
	});

	$effect(() => {
		if (config.alpha !== alpha) {
			alpha = config.alpha;
		}
	});

	$effect.pre(() => {
		reheatSimulation({
			hasLinkForce: config.hasLinkForce,
			hasChargeForce: config.hasChargeForce,
			hasCollideForce: config.hasCollideForce,
			hasCenterForce: config.hasCenterForce
		});
	});

	const linkForce = $derived(
		forceLink<MySimulationNodeDatum, MySimulationLinkDatum>(links).id((d) => d.id)
	);
	const chargeForce = forceManyBody<MySimulationNodeDatum>();
	const collideForce = forceCollide<MySimulationNodeDatum>();
	const centerForce = forceCenter<MySimulationNodeDatum>(0, 0);

	$effect(() => {
		reheatSimulation();
		linkForce.distance(config.linkDistance);
	});

	$effect(() => {
		reheatSimulation();
		chargeForce
			.distanceMin(config.chargeDistanceMin)
			.distanceMax(config.chargeDistanceMax)
			.strength(config.chargeStrength);
	});

	$effect(() => {
		reheatSimulation();
		collideForce.radius(config.collideRadius).strength(config.collideStrength);
	});

	$effect(() => {
		reheatSimulation();
		centerForce.strength(config.centerStrength);
	});

	function handleStart() {
		config.running = true;
	}

	function handleTick(e: { alpha: number; alphaTarget: number }) {
		// If we weren't already using `bind:alpha`, then this is
		// where we would get access to the current values of
		// `alpha` and `alphaTarget` and could make adjustments accordingly.
	}

	function handleEnd() {
		config.running = false;
	}

	function reheatSimulation(args: Record<string, any> = {}) {
		const _ = args;
		alpha = 1.0;
		config.alpha = 1.0;
	}

	export { data };
</script>

<ForceGraphControls bind:config />

<Chart height={600}>
	{#snippet children({ context })}
		<Layer>
			<ForceSimulation
				forces={{
					...(config.hasLinkForce && { link: linkForce }),
					...(config.hasChargeForce && { charge: chargeForce }),
					...(config.hasCollideForce && { collide: collideForce }),
					...(config.hasCenterForce && {
						center: centerForce.x(context.width / 2).y(context.height / 2)
					})
				}}
				bind:alpha
				alphaTarget={config.alphaTarget}
				stopped={config.isStopped}
				static={config.isStatic}
				onStart={handleStart}
				onTick={handleTick}
				onEnd={handleEnd}
				data={{ nodes, links }}
			>
				{#snippet children({ nodes, linkPositions })}
					{#each links as link, i}
						<Link
							data={link}
							explicitCoords={linkPositions[i]}
							class="stroke-surface-content"
							curve={curveLinear}
							stroke-width={config.linkWidth}
							opacity={config.linkOpacity}
						/>
					{/each}

					{#each nodes as node}
						<Circle
							cx={node.x}
							cy={node.y}
							r={config.nodeRadius}
							fill={colorScale(node.group.toString())}
							stroke-width={config.nodeStrokeWidth}
							class="stroke-surface-content"
							onpointermove={(e) => context.tooltip.show(e, node)}
							onpointerleave={context.tooltip.hide}
						/>
					{/each}
				{/snippet}
			</ForceSimulation>
		</Layer>

		<Tooltip.Root>
			{context.tooltip.data?.id}
		</Tooltip.Root>
	{/snippet}
</Chart>
