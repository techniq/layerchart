<script context="module" lang="ts">
	import { LayerCake, Svg, Html } from 'layercake';

	export { Svg, Html };
</script>

<script lang="ts">
	import { max, min } from 'd3-array';
	import { get } from 'lodash-es';
	import { isScaleBand } from '$lib/utils/scales';

	type Accessor = string | ((d: any) => number);

	/**
	 *  Resolve a value from data based on the accessor type
	 */
	function getValue(accessor: Accessor | Accessor[], d) {
		console.log({ accessor });
		if (Array.isArray(accessor)) {
			return accessor.map((a) => getValue(a, d));
		} else if (typeof accessor === 'function') {
			return accessor(d) || 0;
		} else if (typeof accessor === 'string') {
			return get(d, accessor);
		} else {
			throw new Error('Unexpected accessor: ' + accessor);
		}
	}

	export let data: any[] = [];

	export let x: Accessor | Accessor[];
	export let y: Accessor | Accessor[];
	export let yScale: Function;

	/**
	 * xBaseline guaranteed to be visible in xDomain
	 */
	export let xBaseline: number | null = null;

	let xDomain = undefined;
	$: if (xBaseline != null) {
		const xValues = data.flatMap((d) => getValue(x, d));
		xDomain = [min([xBaseline, ...xValues]), max([xBaseline, ...xValues])];
	}

	/**
	 * yBaseline guaranteed to be visible in yDomain
	 */
	export let yBaseline: number | null = null;

	let yDomain = undefined;
	$: if (yBaseline != null) {
		const yValues = data.flatMap((d) => getValue(y, d));
		yDomain = [min([yBaseline, ...yValues]), max([yBaseline, ...yValues])];
	}

	/**
	 * Reverse the default y range ([0, height] becomes [height, 0]). By default this is `true` unless using scaleBand y scale.
	 * see: https://layercake.graphics/guide#yreverse
	 * see: https://github.com/mhkeller/layercake/issues/83
	 */
	$: yReverse = yScale ? !isScaleBand(yScale) : true;
</script>

<LayerCake {data} {x} {xDomain} {y} {yScale} {yDomain} {yReverse} {...$$restProps}>
	<slot />
</LayerCake>
