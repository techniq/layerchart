<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { timeDay } from 'd3-time';
	import {
		Area,
		Axis,
		Chart,
		ChartClipPath,
		Layer,
		LinearGradient,
		Rule,
		type DomainType
	} from 'layerchart';
	import { randomWalk } from '$lib/utils/data.js';

	let { data } = $props();

	const now = new Date();
	let xDomain = $state([timeDay.offset(now, -60), timeDay.offset(now, -30)]) as
		| DomainType
		| undefined;

	const seriesData = [
		randomWalk({ count: 100 }).map((value, i) => ({
			date: timeDay.offset(now, -i),
			value: 10 + value
		})),
		randomWalk({ count: 100 }).map((value, i) => ({
			date: timeDay.offset(now, -i),
			value: 10 + value
		})),
		randomWalk({ count: 100 }).map((value, i) => ({
			date: timeDay.offset(now, -i),
			value: 10 + value
		})),
		randomWalk({ count: 100 }).map((value, i) => ({
			date: timeDay.offset(now, -i),
			value: 10 + value
		}))
	];

	const colorScale = scaleOrdinal([
		'var(--color-success-500)',
		'var(--color-info-500)',
		'var(--color-warning-500)',
		'var(--color-danger-500)'
	]);

	export { data };
</script>

<div class="grid grid-cols-2 gap-4">
	{#each seriesData as data, i}
		<div class="border rounded-sm p-4 grid gap-1" style:--chart-color={colorScale(String(i))}>
			<Chart
				{data}
				x="date"
				{xDomain}
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

			<Chart
				{data}
				x="date"
				y="value"
				padding={{ left: 16 }}
				brush={{
					mode: 'separated',
					xDomain,
					onChange: (e) => (xDomain = e.xDomain),
					onReset: (e) => (xDomain = null)
				}}
				height={20}
			>
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
