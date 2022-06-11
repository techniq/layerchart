<script lang="ts">
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { scaleLinear } from 'd3-scale';

	import { tweenedScale } from '$lib/utils/scales';

	export let extents: { x0: number; y0: number; x1: number; y1: number };

	const { width, height } = getContext('LayerCake');

	const tweenedOptions: Parameters<typeof tweenedScale>[1] = { easing: cubicOut, duration: 800 };

	const xScale = tweenedScale(scaleLinear, tweenedOptions);
	$: xScale.domain([extents?.x0 ?? 0, extents?.x1 ?? $width]);
	$: xScale.range([0, $width]);

	const yScale = tweenedScale(scaleLinear, tweenedOptions);
	$: yScale.domain([extents?.y0 ?? 0, extents?.y1 ?? $height]);
	$: yScale.range([0, $height]);
</script>

<slot xScale={$xScale} yScale={$yScale} />
