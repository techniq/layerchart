<script lang="ts">
	import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

	const radius = 50;
</script>

<Chart height={100}>
	<Layer>
		<RadialGradient class="from-green-500 to-blue-500" r="30%" spreadMethod="pad">
			{#snippet children({ gradient })}
				<Circle cx={radius + 0 * 120} cy={radius} r={radius} fill={gradient} />
			{/snippet}
		</RadialGradient>

		<RadialGradient class="from-green-500 to-blue-500" r="30%" spreadMethod="reflect">
			{#snippet children({ gradient })}
				<Circle cx={radius + 1 * 120} cy={radius} r={radius} fill={gradient} />
			{/snippet}
		</RadialGradient>

		<RadialGradient class="from-green-500 to-blue-500" r="30%" spreadMethod="repeat">
			{#snippet children({ gradient })}
				<Circle cx={radius + 2 * 120} cy={radius} r={radius} fill={gradient} />
			{/snippet}
		</RadialGradient>
	</Layer>
</Chart>
