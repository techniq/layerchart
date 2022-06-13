<script lang="ts">
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { scaleLinear } from 'd3-scale';

	import { tweenedScale } from '$lib/utils/scales';

	const { width, height } = getContext('LayerCake');

	type Extents = { x0: number; y0: number; x1: number; y1: number };
	type ExtentsAcccessor = (dimensions: { width: number; height: number }) => Extents;

	export let domain: Extents | ExtentsAcccessor;
	export let range: Extents | ExtentsAcccessor;

	const tweenedOptions: Parameters<typeof tweenedScale>[1] = { easing: cubicOut, duration: 800 };

	function getExtents(extents: Extents | ExtentsAcccessor, axis: 'x' | 'y', fallback: number) {
		const resolvedExtents =
			typeof extents === 'function' ? extents({ width: $width, height: $height }) : extents;

		return [
			resolvedExtents?.[axis + '0'] ?? 0, // x0 or y0
			resolvedExtents?.[axis + '1'] ?? fallback // x1 or y1, fallback as $width or $height
		];
	}

	const xScale = tweenedScale(scaleLinear, tweenedOptions);
	$: xScale.domain(getExtents(domain, 'x', $width));
	$: xScale.range(getExtents(range, 'x', $width));

	const yScale = tweenedScale(scaleLinear, tweenedOptions);
	$: yScale.domain(getExtents(domain, 'y', $height));
	$: yScale.range(getExtents(range, 'y', $height));
</script>

<slot xScale={$xScale} yScale={$yScale} />
