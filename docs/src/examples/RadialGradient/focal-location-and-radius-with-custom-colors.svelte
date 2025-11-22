<script lang="ts">
	import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

	const radius = 50;
</script>

<Chart height={100}>
	<Layer>
		<RadialGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
			{#snippet children({ gradient })}
				<Circle cx={radius + 0 * 120} cy={radius} r={radius} fill={gradient} />
			{/snippet}
		</RadialGradient>

		<RadialGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} fx="20%" fy="20%">
			{#snippet children({ gradient })}
				<Circle cx={radius + 1 * 120} cy={radius} r={radius} fill={gradient} />
			{/snippet}
		</RadialGradient>

		<RadialGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} r="30%">
			{#snippet children({ gradient })}
				<Circle cx={radius + 2 * 120} cy={radius} r={radius} fill={gradient} />
			{/snippet}
		</RadialGradient>
	</Layer>
</Chart>
