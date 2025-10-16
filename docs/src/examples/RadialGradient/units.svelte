<script lang="ts">
	import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

	const radius = 50;
	const data = $derived([]);

	export { data };
</script>

<Chart height={400}>
	<Layer>
		<RadialGradient class="from-green-500 to-blue-500" units="objectBoundingBox">
			{#snippet children({ gradient })}
				{#each { length: 6 } as _, i}
					<Circle cx={radius + i * 120} cy={radius} r={radius} fill={gradient} />
				{/each}
			{/snippet}
		</RadialGradient>

		<RadialGradient class="from-green-500 to-blue-500" units="userSpaceOnUse">
			{#snippet children({ gradient })}
				{#each { length: 6 } as _, i}
					<Circle cx={radius + i * 120} cy={120 + radius} r={radius} fill={gradient} />
				{/each}
			{/snippet}
		</RadialGradient>
	</Layer>
</Chart>
