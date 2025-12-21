<script lang="ts">
	import { Chart, Layer, Text } from 'layerchart';
</script>

<Chart height={60}>
	<Layer center>
		<Text
			value={'Inline Example Text'}
			textAnchor="middle"
			verticalAnchor="middle"
			class="text-4xl text-[var(--color-orange-500)]"
		/>
	</Layer>
</Chart>
