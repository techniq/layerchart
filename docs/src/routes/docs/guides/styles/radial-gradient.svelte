<script lang="ts">
	import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

	const radius = 150;
</script>

<Chart height={300}>
	<Layer center>
		<RadialGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
			{#snippet children({ gradient })}
				<Circle r={radius} fill={gradient} />
			{/snippet}
		</RadialGradient>
	</Layer>
</Chart>
