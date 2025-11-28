<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
</script>

<Chart xDomain={[0, 100]} padding={24} height={48}>
	<Layer>
		<Axis placement="bottom" rule ticks={(scale) => [45, ...(scale.ticks?.() ?? [])]} />
	</Layer>
</Chart>
