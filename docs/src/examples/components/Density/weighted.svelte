<script lang="ts">
	import { Axis, Chart, ChartClipPath, Circle, Density, Layer } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	import { getPenguins } from '$lib/data.remote.js';

	const penguins = (await getPenguins()).filter(
		(d) => d.sex !== 'NA' && d.flipper_length_mm !== 'NA' && d.bill_length_mm !== 'NA'
	);

	let skew = $state(0);
</script>

<div class="mb-4">
	<RangeField label="Skew" bind:value={skew} min={-1} max={1} step={0.1} />
</div>

<Chart
	data={penguins}
	x="flipper_length_mm"
	y="bill_length_mm"
	xNice
	yNice
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<ChartClipPath>
			<Density
				weight={(d) => (d.sex === 'female' ? 1 - skew : 1 + skew)}
				fill="none"
				class="stroke-surface-content/30"
			/>
		</ChartClipPath>
		<Circle
			cx="flipper_length_mm"
			cy="bill_length_mm"
			r={2}
			fill={(d) => (d.sex === 'female' ? 'var(--color-primary)' : 'var(--color-secondary)')}
			opacity={(d) => (d.sex === 'female' ? 1 - skew : 1 + skew) * 0.7}
		/>
	</Layer>
</Chart>
