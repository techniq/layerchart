<script>
	import { scaleOrdinal } from 'd3-scale';
	import { schemeSpectral } from 'd3-scale-chromatic';
	import { Legend } from 'layerchart';
</script>

<Legend
	scale={scaleOrdinal(
		['<10', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '≥80'],
		schemeSpectral[10]
	)}
	title="Age (years)"
>
	{#snippet children({ scale, values })}
		<div class="flex gap-4">
			{#each values as value}
				<div class="flex gap-1">
					<div class="h-4 w-4 rounded-full" style:background-color={scale?.(value)}></div>
					<div class="text-xs text-surface-content/50">{value}</div>
				</div>
			{/each}
		</div>
	{/snippet}
</Legend>
