<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { timeDay } from 'd3-time';
	import {
		Area,
		Axis,
		Chart,
		ChartClipPath,
		ChartGroup,
		Layer,
		LinearGradient,
		Rule
	} from 'layerchart';
	import { randomWalk } from '$lib/utils/data.js';

	const now = new Date();

	const seriesData = Array.from({ length: 4 }, () =>
		randomWalk({ count: 100 }).map((value, i) => ({
			date: timeDay.offset(now, -i),
			value: 10 + value
		}))
	);

	const colorScale = scaleOrdinal([
		'var(--color-success-500)',
		'var(--color-info-500)',
		'var(--color-warning-500)',
		'var(--color-danger-500)'
	]);

	export const data = seriesData[0];
</script>

<!--
	The overview charts share one brush through the group, and each detail chart takes its domain
	straight from `group.brush` — no shared `$state` and no `onChange` plumbing.
-->
<ChartGroup>
	{#snippet children({ group })}
		{@const selection = group.brush.active ? (group.brush.x as any) : undefined}
		<div class="grid grid-cols-2 gap-4">
			{#each seriesData as data, i (i)}
				<div class="border rounded-sm p-4 grid gap-1" style:--chart-color={colorScale(String(i))}>
					<Chart
						{data}
						x="date"
						xDomain={selection}
						y="value"
						yBaseline={0}
						padding={{ left: 16, bottom: 24 }}
						height={100}
					>
						<Layer>
							<Axis placement="left" grid rule />
							<Axis placement="bottom" />
							<Rule y={0} />
							<ChartClipPath>
								<LinearGradient
									class="from-[color-mix(in_lch,var(--chart-color)_50%,_transparent)] to-transparent"
									vertical
								>
									{#snippet children({ gradient })}
										<Area line={{ class: 'stroke-2 stroke-(--chart-color)' }} fill={gradient} />
									{/snippet}
								</LinearGradient>
							</ChartClipPath>
						</Layer>
					</Chart>

					<Chart {data} x="date" y="value" padding={{ left: 16 }} brush height={20}>
						<Layer>
							<Area
								line={{ class: 'stroke-2 stroke-(--chart-color)' }}
								class="fill-(--chart-color) opacity-20"
							/>
						</Layer>
					</Chart>
				</div>
			{/each}
		</div>
	{/snippet}
</ChartGroup>
