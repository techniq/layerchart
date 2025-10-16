<script>
	import { Legend } from 'layerchart';
	import { scaleSqrt } from 'd3-scale';
</script>

<div class="grid gap-6">
	<Legend scale={scaleSqrt([-100, 0, 100], ['blue', 'white', 'red'])} title="Temperature (°C)" />
	<Legend
		scale={scaleSqrt([-100, 0, 100], ['blue', 'white', 'red'])}
		title="Temperature (°C)"
		variant="swatches"
	/>
</div>
