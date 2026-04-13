<script lang="ts">
	import { Chart, Layer, Text } from 'layerchart';
</script>

<Chart height={80}>
	<Layer>
		<Text
			segments={[
				{ value: 'Revenue', class: 'text-sm font-semibold fill-primary' },
				{ value: ' $1,200', class: 'text-xs font-light fill-surface-content/75' }
			]}
			x={0}
			y={20}
		/>
		<Text
			segments={[
				{ value: 'Growth', class: 'text-sm font-semibold fill-primary' },
				{ value: ' +12%', class: 'text-xs font-light fill-success' }
			]}
			x={0}
			y={50}
		/>
	</Layer>
</Chart>
