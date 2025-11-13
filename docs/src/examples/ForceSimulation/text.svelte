<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { forceX, forceY, forceManyBody, forceCollide, type SimulationNodeDatum } from 'd3-force';

	import { Chart, ForceSimulation, Layer, Points } from 'layerchart';
	import ForceTextControls from '$lib/components/ForceTextControls.svelte';

	import { rasterizeText, type RasterizeTextOptions } from '$lib/utils/string.js';

	const collisionStrength = 0.01;

	let width = $state(960);
	let height = $state(500);
	let transition = $state(false);

	let config = $state({
		text: 'LayerChart',
		fontSize: 124,
		spacing: 10,
		radius: 2,
		hasCollideForce: true,
		hasChargeForce: false
	});

	const onResize: ComponentProps<typeof Chart>['onResize'] = (e) => {
		width = e.width;
		height = e.height;
	};

	let mouseNode = $derived({
		x: 0,
		y: height / 2,
		xTarget: width,
		yTarget: height / 2,
		rTarget: 100
	} as SimulationNodeDatum & { xTarget: number; yTarget: number; rTarget: number });

	const textOptions = $derived({
		fontSize: config.fontSize + 'px',
		spacing: config.spacing,
		width: width,
		height: height
	} satisfies RasterizeTextOptions);

	const pixels = $derived(
		rasterizeText(config.text, textOptions).map((d) => {
			return {
				x: transition ? d[0] : Math.random() * width,
				y: transition ? d[1] : Math.random() * height,
				xTarget: d[0],
				yTarget: d[1],
				rTarget: config.radius
			} as SimulationNodeDatum & { xTarget: number; yTarget: number; rTarget: number };
		})
	);

	const forceData = $derived([mouseNode, ...pixels]);
	const xForce = forceX<(typeof pixels)[number]>((d) => d.xTarget).strength(collisionStrength);
	const yForce = forceY<(typeof pixels)[number]>((d) => d.yTarget).strength(collisionStrength);
	const collideForce = forceCollide<(typeof pixels)[number]>()
		.radius((d) => d.rTarget)
		.iterations(3);
	const manyBodyForce = forceManyBody();
</script>

<ForceTextControls bind:config />

<Chart
	data={forceData}
	x="x"
	xDomain={[0, 1]}
	xRange={[0, 1]}
	y="y"
	yDomain={[0, 1]}
	yRange={[0, 1]}
	{onResize}
	height={500}
>
	{#snippet children({ context })}
		<ForceSimulation
			forces={{
				x: xForce,
				y: yForce,
				...(config.hasCollideForce && {
					collide: collideForce
				}),
				...(config.hasChargeForce && {
					charge: manyBodyForce.strength((d, i) => (i ? 0 : (-context.width * 2) / 10))
				})
			}}
			data={{ nodes: forceData }}
			alphaTarget={1}
			velocityDecay={0.2}
		>
			{#snippet children({ nodes, simulation })}
				<Layer
					onpointermove={(e) => {
						simulation.nodes()[0].fx = e.offsetX;
						simulation.nodes()[0].fy = e.offsetY;
					}}
				>
					<Points data={nodes.slice(1)} r={config.radius} class="fill-primary" />
				</Layer>
			{/snippet}
		</ForceSimulation>
	{/snippet}
</Chart>
