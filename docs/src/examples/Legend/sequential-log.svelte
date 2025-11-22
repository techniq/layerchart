<script>
	import { Legend } from 'layerchart';
	import { scaleSequentialLog } from 'd3-scale';
	import { interpolateBlues } from 'd3-scale-chromatic';
</script>

<div class="grid gap-6">
	<Legend
		scale={scaleSequentialLog([1, 100], interpolateBlues)}
		title="Energy (joules)"
		ticks={10}
	/>
	<!-- TODO: Update Legend to hide swatches/ticks without labels -->
	<!-- <Legend
      scale={scaleSequentialLog([1, 100], interpolateBlues)}
      title="Energy (joules)"
      ticks={10}
      variant="swatches"
    /> -->
</div>
