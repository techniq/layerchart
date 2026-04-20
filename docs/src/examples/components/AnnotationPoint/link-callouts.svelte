<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationPoint, LineChart, type Placement } from 'layerchart';
	import type { ComponentProps } from 'svelte';

	const annotations: Array<ComponentProps<typeof AnnotationPoint>> = [
		{
			x: new Date('June 29, 2007'),
			y: 121.89,
			r: 10,
			label: 'iPhone launches',
			labelPlacement: 'top',
			labelXOffset: 20,
			labelYOffset: 40,
			link: { type: 'beveled', radius: 15, sweep: 'vertical-horizontal' },
			props: {
				circle: { class: 'stroke-secondary fill-secondary/10' },
				label: { textAnchor: 'start', verticalAnchor: 'middle', dx: 4 }
			}
		},
		{
			x: new Date('April 3, 2010'),
			y: 232.39,
			r: 10,
			label: 'iPad debuts',
			labelPlacement: 'top-left',
			labelXOffset: 20,
			labelYOffset: 40,
			link: { type: 'swoop' },
			props: {
				circle: { class: 'stroke-secondary fill-secondary/10' }
			}
		},
		{
			x: new Date('March 7, 2012'),
			y: 545.18,
			r: 10,
			label: 'New iPad (3rd Gen)',
			labelPlacement: 'left',
			labelXOffset: 30,
			link: true,
			props: {
				circle: { class: 'stroke-secondary fill-secondary/10' }
			}
		}
	];

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks()}
		{#each annotations as annotation, i (i)}
			<AnnotationPoint {...annotation} />
		{/each}
	{/snippet}
</LineChart>
