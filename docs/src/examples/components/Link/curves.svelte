<script module>
	export const title = 'D3 curves';
	export const description =
		'When `type="d3"`, Link supports any d3 curve factory. Step curves are axis-aware via `orientation`.';
</script>

<script lang="ts">
	import { Chart, Circle, Layer, Link } from 'layerchart';
	import {
		curveBumpX,
		curveBumpY,
		curveLinear,
		curveCatmullRom,
		curveMonotoneX,
		curveMonotoneY,
		curveStep,
		curveStepBefore,
		curveStepAfter,
		type CurveFactory
	} from 'd3-shape';

	const curves: { label: string; value: CurveFactory | undefined }[] = [
		{ label: 'default', value: undefined },
		{ label: 'linear', value: curveLinear },
		{ label: 'bumpX', value: curveBumpX },
		{ label: 'bumpY', value: curveBumpY },
		{ label: 'catmullRom', value: curveCatmullRom },
		{ label: 'monotoneX', value: curveMonotoneX },
		{ label: 'monotoneY', value: curveMonotoneY },
		{ label: 'step', value: curveStep },
		{ label: 'stepBefore', value: curveStepBefore },
		{ label: 'stepAfter', value: curveStepAfter }
	];

	const orientations = [
		{ label: 'horizontal', value: 'horizontal' as const },
		{ label: 'vertical', value: 'vertical' as const }
	];

	const chartHeight = 100;
	const pad = 16;
</script>

<div
	class="grid gap-4"
	style="grid-template-columns: repeat({orientations.length}, minmax(0, 1fr));"
>
	{#each orientations as { label, value } (label)}
		<div>
			<div class="text-center text-sm font-semibold text-surface-content/60 mb-2">{label}</div>
			<div class="flex flex-col gap-2">
				{#each curves as curve (curve.label)}
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
										type="d3"
										curve={curve.value}
										orientation={value}
										class="stroke-primary stroke-2 fill-none"
									/>
									<Circle cx={x1} cy={y1} r={4} class="fill-info" />
									<Circle cx={x2} cy={y2} r={4} class="fill-accent" />
								</Layer>
							{/snippet}
						</Chart>
						<span class="text-xs text-surface-content/50 w-24 shrink-0">{curve.label}</span>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
