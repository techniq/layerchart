<script lang="ts">
	import { max } from 'd3-array';
	import { lab } from 'd3-color';
	import { quantize } from 'd3-interpolate';
	import { interpolateSpectral } from 'd3-scale-chromatic';
	import { Area, Axis, Chart, Labels, Layer, Legend, Spline } from 'layerchart';
	import { getProgrammingLanguages } from '$lib/data.remote';

	const languages = $derived(await getProgrammingLanguages());

	/** The most popular languages now */
	const top = $derived.by(() => {
		const latest = max(languages, (d) => +d.date);
		return languages
			.filter((d) => +d.date === latest)
			.sort((a, b) => b.value - a.value)
			.slice(0, 8)
			.map((d) => d.name);
	});

	const data = $derived(languages.filter((d) => top.includes(d.name)));

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	c="name"
	cDomain={top}
	cRange={quantize(interpolateSpectral, top.length)}
	seriesLayout="stack"
	yNice
	padding={{ top: 32, left: 32, bottom: 20, right: 10 }}
	height={400}
>
	<Layer>
		<Axis placement="left" format="percentRound" grid rule />
		<Axis placement="bottom" rule />
		<!-- Solid bands, then the gaps between them: each band's top, in the background's color -->
		<Area fill="name" />
		<Spline g="name" class="stroke-surface-100 stroke-2" />
		<!-- One label in each language's band, nearest its center where the name fits (near-black
		     on the light bands, white on the dark) -->
		<Labels
			layout="shape"
			occlude
			fill={(d) => (lab(d.color).l > 60 ? '#0b0b0b' : '#ffffff')}
			class="font-semibold stroke-none"
		/>
	</Layer>

	<!-- Identity for the bands too thin to label -->
	<Legend placement="top" />
</Chart>
