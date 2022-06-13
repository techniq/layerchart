<script lang="ts">
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { scaleLinear } from 'd3-scale';

	import { tweenedScale } from '$lib/utils/scales';

	export let domain: { x0: number; y0: number; x1: number; y1: number };
	export let range: { x0: number; y0: number; x1: number; y1: number };

	const { width, height } = getContext('LayerCake');

	const tweenedOptions: Parameters<typeof tweenedScale>[1] = { easing: cubicOut, duration: 800 };

	const xScale = tweenedScale(scaleLinear, tweenedOptions);
	$: xScale.domain([domain?.x0 ?? 0, domain?.x1 ?? $width]);
	$: xScale.range([range?.x0 ?? 0, range?.x1 ?? $width]);

	const yScale = tweenedScale(scaleLinear, tweenedOptions);
	$: yScale.domain([domain?.y0 ?? 0, domain?.y1 ?? $height]);
	$: yScale.range([range?.y0 ?? 0, range?.y1 ?? $height]);
</script>

<slot xScale={$xScale} yScale={$yScale} />
