<script lang="ts">
	/*
		TODO:
		- [ ] Allow spring/tweened to be reactive (but ignore value)
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

	import { getContext } from 'svelte';
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
	import { arc as d3arc } from 'd3-shape';
	import { scaleLinear } from 'd3-scale';
	import { getMotionStore } from '$lib/stores/motionStore';
	import { degreesToRadians } from '$lib/utils/math';

	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	export let value = 0;
	let tweened_value = getMotionStore(value, { spring, tweened });
	$: tweened_value.set(value);

	export let domain = [0, 100];

	/**
	 * Range [min,max] in degrees.  See also startAngle/endAngle
	 */
	export let range = [0, 360]; // degrees

	/**
	 * Start angle in radians
	 */
	export let startAngle: number = undefined;

	/**
	 * End angle in radians
	 */
	export let endAngle: number = undefined;

	/**
	 * Define innerRadius.
	 *   value >= 1: discrete value
	 *   value >  0: percent of `outerRadius`
	 *   value <  0: offset of `outerRadius`
	 *   default: yRange min
	 */
	export let innerRadius = undefined;

	/**
	 * Define outerRadius.  Defaults to yRange max/2 (ie. chart height / 2)
	 */
	export let outerRadius = undefined;

	export let cornerRadius = 0;
	export let padAngle = 0;
	// export let padRadius = 0;

	export let track: boolean | svelte.JSX.SVGProps<SVGPathElement> = false;

	const { yRange } = getContext('LayerCake');

	$: scale = scaleLinear().domain(domain).range(range);

	$: _outerRadius = outerRadius ?? $yRange[0] / 2;
	$: _innerRadius =
		(innerRadius > 1
			? innerRadius
			: innerRadius > 0
			? _outerRadius * innerRadius
			: innerRadius < 0
			? _outerRadius - innerRadius
			: innerRadius) ?? $yRange[1];

	$: arc = d3arc()
		.innerRadius(_innerRadius)
		.outerRadius(_outerRadius)
		.startAngle(startAngle ?? degreesToRadians(range[0]))
		.endAngle(endAngle ?? degreesToRadians(scale($tweened_value)))
		.cornerRadius(cornerRadius)
		.padAngle(padAngle);
	// .padRadius(padRadius);

	$: trackArc = d3arc()
		.innerRadius(_innerRadius)
		.outerRadius(_outerRadius)
		.startAngle(startAngle ?? degreesToRadians(range[0]))
		.endAngle(endAngle ?? degreesToRadians(range[1]))
		.cornerRadius(cornerRadius)
		.padAngle(padAngle);
	// .padRadius(padRadius);

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
		// x: outerRadius - boundingBox.width / 2,
		x: outerRadius - boundingBox.width / 2,
		// x: 0,
		// y: (outerRadius - boundingBox.height) * -1
		y: (outerRadius - boundingBox.height) * -1
	};
	// $: console.log(labelArcBottomOffset)

	/**
	 * Offset arc from center
	 */
	export let offset = 0;
	$: angle = (startAngle + endAngle) / 2;
	$: xOffset = Math.sin(angle) * offset;
	$: yOffset = -Math.cos(angle) * offset;
</script>

{#if track}
	<path d={trackArc()} class="track" bind:this={trackArcEl} {...track} />
{/if}

<path d={arc()} transform="translate({xOffset}, {yOffset})" {...$$restProps} />

<slot value={$tweened_value} centroid={trackArcCentroid} {boundingBox} />
