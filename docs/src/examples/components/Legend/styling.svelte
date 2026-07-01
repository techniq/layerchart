<script>
	import { Legend } from 'layerchart';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';
</script>

<Legend
	scale={scaleSequential([0, 100], interpolateViridis)}
	title="Temperature (°F)"
	width={600}
	tickFontSize={12}
	tickFormat={(value) => value + '°'}
	classes={{
		root: 'px-3 py-2 bg-surface-200',
		title: 'text-lg text-center',
		label: 'fill-surface-content/50',
		tick: 'stroke-surface-100'
	}}
/>
