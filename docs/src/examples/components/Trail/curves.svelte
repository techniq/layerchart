<script module>
	export const title = 'Curves and caps';
	export const description =
		'The trail mark supports round and butt capping and different interpolation methods.';
</script>

<script lang="ts">
	import { Chart, Layer, Spline, Trail } from 'layerchart';
	import {
		curveLinear,
		curveNatural,
		curveBasis,
		curveBumpX,
		curveCatmullRom,
		curveMonotoneX,
		type CurveFactory
	} from 'd3-shape';

	const curves: { label: string; value: CurveFactory }[] = [
		{ label: 'linear', value: curveLinear },
		{ label: 'natural', value: curveNatural },
		{ label: 'basis', value: curveBasis },
		{ label: 'bump-x', value: curveBumpX },
		{ label: 'catmull-rom', value: curveCatmullRom },
		{ label: 'monotone-x', value: curveMonotoneX }
	];

	const caps = ['round', 'butt'] as const;

	const data = [
		{ x: 0, y: 1, r: 2 },
		{ x: 1, y: 3, r: 8 },
		{ x: 2, y: 0.5, r: 14 },
		{ x: 3, y: 2, r: 5 }
	];
</script>

<div class="grid grid-cols-2 gap-4">
	{#each caps as cap (cap)}
		<div>
			<div class="text-center text-sm font-semibold text-surface-content/60 mb-2">{cap}</div>
			<div class="flex flex-col gap-2">
				{#each curves as curve (curve.label)}
					<div class="flex items-center gap-2">
						<Chart
							{data}
							x="x"
							y="y"
							r="r"
							rRange={[2, 14]}
							padding={10}
							height={60}
							class="flex-1"
						>
							<Layer>
								<Trail curve={curve.value} {cap} class="fill-primary/40" />
								<Spline curve={curve.value} class="stroke-surface-content/40 stroke-1" />
							</Layer>
						</Chart>
						<span class="text-xs text-surface-content/50 w-24 shrink-0">{curve.label}</span>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
