<script module>
	export const title = 'Connector types';
	export const description =
		'Link supports several connector path types across cartesian and radial orientations.';
</script>

<script lang="ts">
	import { Chart, Layer, Link } from 'layerchart';
	import type { ConnectorType } from '$lib/utils/connectorUtils.js';

	const types: ConnectorType[] = ['straight', 'square', 'beveled', 'rounded', 'swoop', 'd3'];

	const orientations = [
		{ label: 'horizontal', value: 'horizontal' as const },
		{ label: 'vertical', value: 'vertical' as const }
	];

	const chartHeight = 100;
	const pad = 16;
</script>

<div class="grid gap-4" style="grid-template-columns: repeat({orientations.length}, minmax(0, 1fr));">
	{#each orientations as { label, value } (label)}
		<div>
			<div class="text-center text-sm font-semibold text-surface-content/60 mb-2">{label}</div>
			<div class="flex flex-col gap-2">
				{#each types as type (type)}
					<div class="flex items-center gap-2">
						<Chart height={chartHeight} padding={pad} class="flex-1">
							{#snippet children({ context })}
								{@const x1 = 0}
								{@const y1 = 0}
								{@const x2 = context.width}
								{@const y2 = context.height}
								<Layer>
									<Link
										{x1}
										{y1}
										{x2}
										{y2}
										{type}
										orientation={value}
										class="stroke-primary stroke-2 fill-none"
									/>
									<circle cx={x1} cy={y1} r={4} class="fill-info" />
									<circle cx={x2} cy={y2} r={4} class="fill-accent" />
								</Layer>
							{/snippet}
						</Chart>
						<span class="text-xs text-surface-content/50 w-20 shrink-0">{type}</span>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
