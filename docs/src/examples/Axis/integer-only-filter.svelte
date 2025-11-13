<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
</script>

<Chart xDomain={[0, 2]} padding={24} height={48}>
	<Layer>
		<Axis placement="bottom" rule ticks={(scale) => scale.ticks?.().filter(Number.isInteger)} />
	</Layer>
</Chart>
