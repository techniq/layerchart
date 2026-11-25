<script lang="ts">
	import { max, rollup, sum } from 'd3-array';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { AreaChart } from 'layerchart';
	import { getProgrammingLanguages } from '$lib/data.remote';

	const languages = $derived(await getProgrammingLanguages());

	/** The most popular languages now, and the rest as "Other" */
	const keys = $derived.by(() => {
		const latest = max(languages, (d) => +d.date);
		return languages
			.filter((d) => +d.date === latest)
			.sort((a, b) => b.value - a.value)
			.slice(0, 8)
			.map((d) => d.name);
	});

	/** One row per month, with each language's share (summing the rest into "Other") */
	const data = $derived(
		[
			...rollup(
				languages,
				(rows) => sum(rows, (d) => d.value),
				(d) => d.date,
				(d) => (keys.includes(d.name) ? d.name : 'Other')
			)
		].map(([date, shares]) => ({ date, ...Object.fromEntries(shares) }))
	);

	export { data };
</script>

<AreaChart
	{data}
	x="date"
	series={[...keys, 'Other'].map((key, i) => ({ key, color: schemeTableau10[i] }))}
	seriesLayout="stackExpand"
	labels={{
		layout: 'shape',
		occlude: true,
		class: 'fill-surface-content stroke-surface-100 stroke-[3px] [paint-order:stroke] font-semibold'
	}}
	height={400}
/>
