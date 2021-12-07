<script>
	import { getContext } from 'svelte';

	import Circle from './Circle.svelte';

	const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

	export let r = 5;
	export let fill = '#000';
	export let stroke = '#000';
	export let strokeWidth = 0;
	export let dx = 0;
	export let dy = 0;
</script>

<g class="scatter-group">
	{#each $data as d}
		<Circle
			cx={$xGet(d) + (typeof dx === 'function' ? dx($xScale) : dx)}
			cy={$yGet(d) + (typeof dy === 'function' ? dy($yScale) : dy)}
			{r}
			{fill}
			{stroke}
			stroke-width={strokeWidth}
			{...$$restProps}
		/>
	{/each}
</g>
