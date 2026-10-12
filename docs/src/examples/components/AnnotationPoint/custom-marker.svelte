<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationPoint, Circle, LineChart } from 'layerchart';

	const annotations = [
		{ x: new Date('June 29, 2007'), y: 121.89, label: 'iPhone' },
		{ x: new Date('April 3, 2010'), y: 232.39, label: 'iPad' },
		{ x: new Date('March 7, 2012'), y: 545.18, label: 'Apple TV' }
	];

	const r = 4;

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks()}
		{#each annotations as annotation}
			<AnnotationPoint
				x={annotation.x}
				y={annotation.y}
				{r}
				label={annotation.label}
				labelPlacement="top"
				labelYOffset={6}
				props={{
					label: {
						class: 'fill-primary stroke-surface-100 stroke-[3px] [paint-order:stroke] font-semibold'
					}
				}}
			>
				{#snippet circle({ props })}
					<Circle {...props} r={r + 4} class="fill-primary/20 stroke-primary" />
					<Circle {...props} class="fill-primary stroke-surface-100" strokeWidth={2} />
				{/snippet}
			</AnnotationPoint>
		{/each}
	{/snippet}
</LineChart>
