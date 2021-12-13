<script lang="ts">
	/*
		TODO:
		- [ ] Track on/off and pass props
		- [ ] Text configuration / slot?
		- [ ] Charge usage
		- [ ] Pie usage (second dimension?)
	*/
	// https://caniuse.com/#feat=css-conic-gradients
	// https://css-tricks.com/snippets/css/css-conic-gradient/
	// https://developer.mozilla.org/en-US/docs/Web/CSS/conic-gradient

	// https://stackoverflow.com/questions/2465405/svg-angular-gradient
	// https://stackoverflow.com/questions/18206361/svg-multiple-color-on-circle-stroke

	// https://bl.ocks.org/mbostock/4163057
	// https://github.com/d3/d3/issues/2427#issuecomment-100759055
	// https://github.com/mnsht/gradient-path

	// https://svelte.dev/repl/09711e43a1264ba18945d7db7cab9335?version=3.38.2
	// https://codepen.io/simeydotme/pen/rrOEmO/

	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
	import { arc as d3arc } from 'd3-shape';
	import { scaleLinear } from 'd3-scale';
	import { getMotionStore } from '$lib/stores/motionStore';
	import { degreesToRadians } from '$lib/utils/math';

	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	let width = 200;
	let height = 200;

	export let value = 0;
	const tweened_value = getMotionStore(value, { spring, tweened });
	$: tweened_value.set(value);

	export let domain = [0, 100];
	export let range = [-120, 120]; // degrees
	export let innerRadius = 50;
	export let outerRadius = 60;
	export let cornerRadius = 10;
	export let label: 'svg-center' | 'arc-center' | 'arc-bottom' | 'arc-centroid' | undefined =
		undefined;

	$: scale = scaleLinear().domain(domain).range(range);

	$: startAngle = degreesToRadians(range[0]);
	$: endAngle = degreesToRadians(range[1]);
	$: valueAngle = degreesToRadians(scale($tweened_value));

	$: arc = d3arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius)
		.startAngle(startAngle)
		.endAngle(valueAngle)
		.cornerRadius(cornerRadius);

	$: trackArc = d3arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle)
		.cornerRadius(cornerRadius);

	$: trackArcCentroid = trackArc.centroid();
	// $: console.log(trackArcCentroid)

	let trackArcEl;
	$: boundingBox = trackArc && trackArcEl ? trackArcEl.getBBox() : {};
	// $: console.log(boundingBox)

	$: labelArcCenterOffset = {
		x: outerRadius - boundingBox.width / 2,
		// x: 0,
		y: (outerRadius - boundingBox.height / 2) * -1
	};
	// $: console.log(labelArcCenterOffset)

	$: labelArcBottomOffset = {
		x: outerRadius - boundingBox.width / 2,
		// x: 0,
		y: (outerRadius - boundingBox.height) * -1
	};
	// $: console.log(labelArcBottomOffset)
</script>

<main>
	<svg {width} {height}>
		<path
			d={trackArc()}
			transform="translate({width / 2}, {height / 2})"
			class="track"
			bind:this={trackArcEl}
		/>
		<path d={arc()} transform="translate({width / 2}, {height / 2})" />

		{#if label === 'svg-center'}
			<text transform="translate({width / 2}, {height / 2})" dy={16}>
				{Math.round($tweened_value)}
			</text>
		{/if}

		{#if label === 'arc-center'}
			<text
				x={labelArcCenterOffset.x}
				y={labelArcCenterOffset.y}
				transform="translate({width / 2}, {height / 2})"
				dy={16}
			>
				{Math.round($tweened_value)}
			</text>
		{/if}

		{#if label === 'arc-bottom'}
			<text
				x={labelArcBottomOffset.x}
				y={labelArcBottomOffset.y}
				transform="translate({width / 2}, {height / 2})"
				dy={0}
			>
				{Math.round($tweened_value)}
			</text>
		{/if}

		{#if label === 'arc-centroid'}
			<text
				x={trackArcCentroid[0]}
				y={trackArcCentroid[1]}
				transform="translate({width / 2}, {height / 2})"
				dy={16}
			>
				{Math.round($tweened_value)}
			</text>
		{/if}

		<!-- {#if showCenterGuide}
			<text transform="translate({width / 2}, {height / 2})" dy={16}> + </text>
		{/if} -->

		<defs>
			<linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="hsl(60, 100%, 50%)" />
				<stop offset="100%" stop-color="hsl(140, 100%, 50%)" />
			</linearGradient>
		</defs>
	</svg>
</main>

<style>
	svg {
		background-color: hsl(0, 0%, 0%);
		border: 1px solid #ddd;
	}
	path {
		fill: url(#fillGradient);
		/* 		fill: red; */
		/* 		fill: conic-gradient(gold 40%, #f06 0); */
	}

	.track {
		stroke: hsla(0, 0%, 100%, 0.2);
		stroke-width: 1px;
		fill: none;
	}

	text {
		fill: white;
		font-size: 2rem;
		text-anchor: middle;
	}

	input[type='number'] {
		width: 72px;
	}
</style>
