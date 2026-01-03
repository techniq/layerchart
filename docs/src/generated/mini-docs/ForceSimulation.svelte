
<!--
	@component
	## ForceSimulation

	## Description

	Layout components which positions nodes using physics-based forces, simulating attraction, repulsion, and link constraints to create an intuitive, collision-free network visualization.

	## Category

	[[Layout](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Layout.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [ForceSimulation](/docs/components/ForceSimulation)

	## API Properties

	* forces:<Forces<NodeDatum, LinkDatum>> - Force simulation parameters  (REQUIRED)
	* data:<Data<NodeDatum, LinkDatum>> - An object with arrays of nodes and links,
to be used for position calculation.  (REQUIRED)
	* alpha:<number>=DEFAULT_ALPHA - Current alpha value of the simulation 
	* alphaTarget:<number>=DEFAULT_ALPHA_TARGET - Target alpha value for the simulation 
	* alphaDecay:<number>=DEFAULT_ALPHA_DECAY - Alpha decay rate per tick 
	* alphaMin:<number>=DEFAULT_ALPHA_MIN - Minimum alpha value at which simulation stops 
	* velocityDecay:<number>=DEFAULT_VELOCITY_DECAY - Velocity decay factor applied to nodes each tick 
	* stopped:<boolean>=false - Stop simulation 
	* static:<boolean>=false - If true, will only update nodes after simulation has completed 
	* cloneNodes:<boolean>=false - Clone nodes since simulation mutates original 
	* onStart:<(e: OnStartEvent<NodeDatum, LinkDatum | undefined>) => void> - Callback function triggered when simulation starts 
	* onNodesChange:<(e: OnNodesChangeEvent<NodeDatum, LinkDatum | undefined>) => void> - Callback function triggered right before nodes get passed to the simulation 
	* onTick:<(e: OnTickEvent<NodeDatum, LinkDatum | undefined>) => void> - Callback function triggered on each simulation tick 
	* onEnd:<(e: OnEndEvent<NodeDatum, LinkDatum | undefined>) => void> - Callback function triggered when simulation ends 
	* children:<Snippet<[ { nodes: NodeDatum[]; links: LinkDatum[]; linkPositions: LinkPosition[]; simulation: Simulation<NodeDatum, LinkDatum>; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { hierarchy, type HierarchyLink, type HierarchyNode } from 'd3-hierarchy';
		import { forceX, forceY, forceManyBody, forceLink, type SimulationNodeDatum } from 'd3-force';

		import { Chart, Circle, ForceSimulation, Link, Layer, Tooltip } from 'layerchart';
		import { cls } from '@layerstack/tailwind';
		import { getFlare } from '$lib/data.remote';

		import type { Prettify } from '@layerstack/utils';
		type NodeDatum = { name: string; value: number };
		type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;

		const data = await getFlare();

		const root: HierarchyNode<MySimulationNodeDatum> = hierarchy<MySimulationNodeDatum>(data);
		const nodes: HierarchyNode<MySimulationNodeDatum>[] = root.descendants();
		const links: HierarchyLink<MySimulationNodeDatum>[] = root.links();

		const linkForce = forceLink<
			HierarchyNode<MySimulationNodeDatum>,
			HierarchyLink<MySimulationNodeDatum>
		>(links)
			.distance(0)
			.strength(1);
		const chargeForce = forceManyBody<HierarchyNode<MySimulationNodeDatum>>().strength(-50);
		const xForce = forceX<HierarchyNode<MySimulationNodeDatum>>();
		const yForce = forceY<HierarchyNode<MySimulationNodeDatum>>();
	</script>

	<Chart height={600}>
		{#snippet children({ context })}
			<ForceSimulation
				forces={{
					link: linkForce,
					charge: chargeForce,
					x: xForce,
					y: yForce
				}}
				data={{ nodes, links }}
				cloneNodes
			>
				{#snippet children({ nodes, linkPositions })}
					<Layer center>
						{#each links as link, i}
							<Link data={link} explicitCoords={linkPositions[i]} class="stroke-surface-content/20" />
						{/each}

						{#each nodes as node ([node.data.name, node.parent?.data?.name].join('-'))}
							<Circle
								cx={node.x}
								cy={node.y}
								r={3}
								class={cls(
									node?.children ? 'fill-surface-100 stroke-surface-content' : 'fill-surface-content'
								)}
								onpointermove={(e) => context.tooltip.show(e, node)}
								onpointerleave={context.tooltip.hide}
							/>
						{/each}
					</Layer>
				{/snippet}
			</ForceSimulation>

			<Tooltip.Root>
				{#snippet children({ data })}
					<Tooltip.Header>{data.data.name}</Tooltip.Header>
					<Tooltip.List>
						{#if data.children}
							<Tooltip.Item label="children" value={data.children.length} />
						{/if}
						{#if data.data.value}
							<Tooltip.Item label="value" value={data.data.value} format="integer" />
						{/if}
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</Chart>
	```
-->
