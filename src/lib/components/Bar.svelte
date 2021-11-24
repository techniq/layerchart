<script lang="ts">
	import { getContext } from 'svelte';
	import { scaleBand } from 'd3-scale';
	import { max, min } from 'd3-array';

	import Rect from './Rect.svelte';
	import { unique } from 'svelte-ux/utils/array';

	const { data, flatData, xGet, yRange, xScale, yScale, x, y, rGet, config } =
		getContext('LayerCake');

	/*
    TODO: Support vertical/horizontal layout
      - https://layercake.graphics/example/Bar
      - https://layercake.graphics/example/Column
      - https://layercake.graphics/example/BarStacked
      - https://layercake.graphics/example/ColumnStacked
  */

	export let color: string | ((obj: { value: any; item: any; index: number }) => string) =
		'var(--color-blue-500)';
	export let opacity = 1;
	export let stroke = 'black';
	export let strokeWidth = 0;
	export let radius = 0;
	export let getKey: (item: any, index: number) => any = (item) => $x(item);
	export let getProps: (obj: { value: any; item: any; index: number }) => any = undefined;

	// See: https://svelte.dev/repl/7000c5ce05b84cd98ccbfb2768b4be3d?version=3.38.3

	export let groupBy: string = undefined;
	// export let delay = 300;

	// 	$: console.log({ $data, $flatData, groupBy, stackBy })

	$: groupKeys = unique($flatData.map((d) => d[groupBy])) as string[];
	$: x1Scale = scaleBand().domain(groupKeys).range([0, $xScale.bandwidth()]).paddingInner(0.2);

	$: getDimensions = (item) => {
		// console.log({ item, y: $y(item) });

		const x = $xGet(item) + (groupBy ? x1Scale(item[groupBy]) : 0);

		// TODO: Do we need to support the non-bandwidth scale?
		//   const width = $xScale.bandwidth
		//     ? $xScale.bandwidth()
		//     : Math.max(0, $xGet(d)[1] - $xGet(d)[0]);
		const width = groupBy ? x1Scale.bandwidth() : $xScale.bandwidth();

		const yValue = $y(item);

		let yTop = 0;
		let yBottom = 0;
		if (Array.isArray(yValue)) {
			// Array contains both top and bottom values;
			yTop = max(yValue);
			yBottom = min(yValue);
		} else if (yValue == null) {
			// null/undefined value
			yTop = 0;
			yBottom = 0;
		} else if (yValue > 0) {
			// Positive value
			yTop = yValue;
			yBottom = $yRange[1]; // or `0`?
		} else {
			// Negative value
			yTop = $yRange[1]; // or `0`?
			yBottom = yValue;
		}

		return {
			x,
			y: $yScale(yTop),
			width,
			height: $yScale(yBottom) - $yScale(yTop)
		};
	};

	function getColor(item: any, index: number) {
		if (typeof color === 'function') {
			return color({ value: $y(item), item, index });
		} else if ($config.r) {
			return $rGet(item);
		} else {
			return color;
		}
	}
</script>

<g class="column-group">
	{#each $data as item, index (getKey(item, index))}
		<Rect
			class="group-rect"
			data-id={index}
			fill={getColor(item, index)}
			fill-opacity={opacity}
			{stroke}
			stroke-width={strokeWidth}
			rx={radius}
			{...getDimensions(item)}
			{...getProps?.({ value: $y(item), item, index })}
			{...$$restProps}
		/>
	{/each}
</g>
