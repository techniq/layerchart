<script lang="ts">
	import { PieChart } from 'layerchart';
	import { longData } from '$lib/utils/data';
	import {
		schemeAccent,
		schemeCategory10,
		schemeDark2,
		schemePaired,
		schemePastel1,
		schemePastel2,
		schemeSet1,
		schemeSet2,
		schemeSet3,
		schemeTableau10
	} from 'd3-scale-chromatic';

	const schemes = [
		{ label: 'Tableau10', value: schemeTableau10 },
		{ label: 'Accent', value: schemeAccent },
		{ label: 'Category10', value: schemeCategory10 },
		{ label: 'Dark2', value: schemeDark2 },
		{ label: 'Paired', value: schemePaired },
		{ label: 'Pastel1', value: schemePastel1 },
		{ label: 'Pastel2', value: schemePastel2 },
		{ label: 'Set1', value: schemeSet1 },
		{ label: 'Set2', value: schemeSet2 },
		{ label: 'Set3', value: schemeSet3 }
	];
	const data = longData.filter((d) => d.year === 2019);
	let selectedScheme = $state<(typeof schemes)[number]['value'] | undefined>(undefined);
</script>

<select class="w-50 p-2 border rounded" bind:value={selectedScheme}>
	{#each schemes as scheme}
		<option value={scheme.value}>{scheme.label}</option>
	{/each}
</select>
<PieChart {data} key="fruit" value="value" height={300} cRange={selectedScheme} />
