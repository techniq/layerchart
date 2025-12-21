<script lang="ts">
	import { Chart, Layer, Text } from 'layerchart';
</script>

<div style="color:purple;">
	<Chart height={60}>
		<Layer center>
			<Text
				value={'Inline Example Text'}
				textAnchor="middle"
				verticalAnchor="middle"
				class="text-4xl"
			/>
		</Layer>
	</Chart>
</div>
