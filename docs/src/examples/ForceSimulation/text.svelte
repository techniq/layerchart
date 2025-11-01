<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';

	import { Chart, ForceSimulation, Layer, Points } from 'layerchart';
	import { Field, RangeField, Switch, TextField } from 'svelte-ux';

	import { rasterizeText, type RasterizeTextOptions } from '$lib/utils/string.js';

	const collisionStrength = 0.01;

	let width = $state(960);
	let height = $state(500);
	let radius = $state(2);

	let hasCollideForce = $state(true);
	let hasChargeForce = $state(false);
	let transition = $state(false);

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
	});

	let text = $state('LayerChart');
	let fontSize = $state(124);
	let spacing = $state(10);

	const textOptions = $derived({
		fontSize: fontSize + 'px',
		spacing: spacing,
		width: width,
		height: height
	} satisfies RasterizeTextOptions);

	const pixels = $derived(
		rasterizeText(text, textOptions).map((d) => {
			return {
				x: transition ? d[0] : Math.random() * width,
				y: transition ? d[1] : Math.random() * height,
				xTarget: d[0],
				yTarget: d[1],
				rTarget: radius
			};
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

<div class="grid grid-flow-col gap-2 mb-1">
	<TextField label="Text" bind:value={text} />
	<RangeField label="Font size (px)" bind:value={fontSize} max={600} />
	<RangeField label="Spacing" bind:value={spacing} />
	<RangeField label="Radius" bind:value={radius} min={1} max={spacing * 2} />
</div>
<div class="flex gap-2 mb-2">
	<Field label="Collide Force" let:id>
		<Switch bind:checked={hasCollideForce} {id} size="md" />
	</Field>
	<Field label="Charge Force" let:id>
		<Switch bind:checked={hasChargeForce} {id} size="md" />
	</Field>
	<!-- <Field label="Transition" let:id>
    <Switch bind:checked={transition} {id} size="md" />
  </Field> -->
</div>

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
				...(hasCollideForce && {
					collide: collideForce
				}),
				...(hasChargeForce && {
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
					<Points data={nodes.slice(1)} r={radius} class="fill-primary" />
				</Layer>
			{/snippet}
		</ForceSimulation>
	{/snippet}
</Chart>
