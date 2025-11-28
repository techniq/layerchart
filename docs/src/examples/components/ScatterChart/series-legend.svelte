<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { getPenguins } from '$lib/data.remote';
	import { flatGroup } from 'd3-array';

	const data = $derived(
		flatGroup(
			(await getPenguins()).filter(
				(d) => d.flipper_length_mm !== 'NA' && d.bill_length_mm !== 'NA'
			),
			(d) => d.species
		)
	);
	export { data };
</script>

<ScatterChart
	x="flipper_length_mm"
	y="bill_length_mm"
	series={data.map(([species, data], i) => {
		const color = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i];
		return {
			key: species,
			data,
			color,
			props: {
				stroke: color,
				fillOpacity: 0.3
			}
		};
	})}
	legend
	padding={{ left: 10, top: 10, right: 10, bottom: 48 }}
	height={400}
/>
