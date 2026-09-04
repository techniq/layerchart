<script lang="ts">
	import { Axis, Chart, Layer, Spline, pivotLonger } from 'layerchart';
	import { Button } from 'svelte-ux';
	import LucideRefreshCw from '~icons/lucide/refresh-cw';

	import { createDateSeries } from '$lib/utils/data.js';

	const keys = ['apples', 'bananas', 'oranges'];

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	function generate() {
		const series = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		return pivotLonger(series, keys, 'fruit', 'value');
	}

	let data = $state(generate());

	export { data };
</script>

<Button
	variant="outline"
	size="sm"
	icon={LucideRefreshCw}
	class="mb-2"
	onclick={() => (data = generate())}
>
	Update date
</Button>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, 100]}
	c="fruit"
	cDomain={Object.keys(fruitColors)}
	cRange={Object.values(fruitColors)}
	padding={20}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<!-- One line per fruit, from a single mark — each tweens on its own -->
		<Spline motion="tween" class="stroke-2" />
	</Layer>
</Chart>
