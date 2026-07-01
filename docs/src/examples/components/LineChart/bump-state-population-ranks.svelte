<script lang="ts">
	import { Chart, Axis, LinearGradient, Layer, Spline } from 'layerchart';
	import { curveBumpX } from 'd3-shape';
	import { scaleLinear, scalePoint } from 'd3-scale';
	import { cls } from '@layerstack/tailwind';

	const states = [
		{ name: 'AK', ranks: [51, 51, 51, 51, 51, 51, 51, 50, 48, 47, 48] },
		{ name: 'AL', ranks: [18, 15, 17, 17, 19, 21, 22, 22, 23, 23, 24] },
		{ name: 'AR', ranks: [25, 25, 24, 31, 31, 32, 33, 33, 33, 32, 33] },
		{ name: 'AZ', ranks: [46, 44, 44, 38, 35, 33, 29, 24, 20, 16, 14] },
		{ name: 'CA', ranks: [8, 6, 4, 2, 2, 1, 1, 1, 1, 1, 1] },
		{ name: 'CO', ranks: [33, 33, 33, 34, 33, 30, 28, 26, 24, 22, 21] },
		{ name: 'CT', ranks: [29, 29, 31, 28, 25, 24, 25, 27, 29, 29, 29] },
		{ name: 'DC', ranks: [42, 41, 37, 36, 40, 41, 47, 48, 50, 50, 49] },
		{ name: 'DE', ranks: [48, 48, 48, 48, 47, 47, 48, 46, 45, 45, 45] },
		{ name: 'FL', ranks: [32, 31, 25, 20, 10, 9, 7, 4, 4, 4, 3] },
		{ name: 'GA', ranks: [12, 14, 14, 13, 16, 15, 13, 11, 10, 9, 8] },
		{ name: 'HI', ranks: [47, 46, 46, 46, 44, 40, 39, 40, 42, 40, 40] },
		{ name: 'IA', ranks: [17, 19, 20, 22, 24, 25, 27, 30, 30, 30, 31] },
		{ name: 'ID', ranks: [43, 43, 43, 44, 43, 43, 41, 42, 39, 39, 38] },
		{ name: 'IL', ranks: [3, 3, 3, 4, 4, 5, 5, 6, 5, 5, 6] },
		{ name: 'IN', ranks: [11, 11, 12, 11, 11, 11, 12, 14, 14, 15, 17] },
		{ name: 'KS', ranks: [24, 24, 29, 30, 28, 28, 32, 32, 32, 33, 35] },
		{ name: 'KY', ranks: [15, 16, 16, 19, 22, 23, 23, 23, 25, 26, 26] },
		{ name: 'LA', ranks: [22, 22, 21, 21, 20, 20, 19, 21, 22, 25, 25] },
		{ name: 'MA', ranks: [6, 8, 8, 9, 9, 10, 11, 13, 13, 14, 15] },
		{ name: 'MD', ranks: [28, 28, 28, 24, 21, 18, 18, 19, 19, 19, 18] },
		{ name: 'ME', ranks: [35, 35, 35, 35, 36, 38, 38, 38, 40, 41, 42] },
		{ name: 'MI', ranks: [7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 10] },
		{ name: 'MN', ranks: [16, 18, 18, 18, 18, 19, 21, 20, 21, 21, 22] },
		{ name: 'MO', ranks: [9, 10, 10, 12, 13, 13, 15, 15, 17, 18, 19] },
		{ name: 'MS', ranks: [23, 23, 23, 26, 29, 29, 31, 31, 31, 31, 34] },
		{ name: 'MT', ranks: [39, 39, 40, 43, 42, 44, 44, 44, 44, 44, 44] },
		{ name: 'NC', ranks: [14, 12, 11, 10, 12, 12, 10, 10, 11, 10, 9] },
		{ name: 'ND', ranks: [36, 38, 39, 42, 45, 46, 46, 47, 47, 48, 47] },
		{ name: 'NE', ranks: [31, 32, 32, 33, 34, 35, 35, 36, 38, 38, 37] },
		{ name: 'NH', ranks: [41, 42, 45, 45, 46, 42, 42, 41, 41, 42, 41] },
		{ name: 'NJ', ranks: [10, 9, 9, 8, 8, 8, 9, 9, 9, 11, 11] },
		{ name: 'NM', ranks: [44, 45, 42, 40, 37, 37, 37, 37, 36, 36, 36] },
		{ name: 'NV', ranks: [50, 50, 50, 50, 50, 48, 43, 39, 35, 35, 32] },
		{ name: 'NY', ranks: [1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4] },
		{ name: 'OH', ranks: [4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7] },
		{ name: 'OK', ranks: [21, 21, 22, 25, 27, 27, 26, 28, 27, 28, 28] },
		{ name: 'OR', ranks: [34, 34, 34, 32, 32, 31, 30, 29, 28, 27, 27] },
		{ name: 'PA', ranks: [2, 2, 2, 3, 3, 3, 4, 5, 6, 6, 5] },
		{ name: 'RI', ranks: [38, 37, 36, 37, 39, 39, 40, 43, 43, 43, 43] },
		{ name: 'SC', ranks: [26, 26, 27, 27, 26, 26, 24, 25, 26, 24, 23] },
		{ name: 'SD', ranks: [37, 36, 38, 41, 41, 45, 45, 45, 46, 46, 46] },
		{ name: 'TN', ranks: [20, 17, 15, 15, 17, 17, 17, 18, 16, 17, 16] },
		{ name: 'TX', ranks: [5, 5, 6, 6, 6, 4, 3, 3, 2, 2, 2] },
		{ name: 'UT', ranks: [40, 40, 41, 39, 38, 36, 36, 35, 34, 34, 30] },
		{ name: 'VA', ranks: [19, 20, 19, 16, 14, 14, 14, 12, 12, 12, 12] },
		{ name: 'VT', ranks: [45, 47, 47, 47, 48, 49, 49, 49, 49, 49, 50] },
		{ name: 'WA', ranks: [30, 30, 30, 23, 23, 22, 20, 17, 15, 13, 13] },
		{ name: 'WI', ranks: [13, 13, 13, 14, 15, 16, 16, 16, 18, 20, 20] },
		{ name: 'WV', ranks: [27, 27, 26, 29, 30, 34, 34, 34, 37, 37, 39] },
		{ name: 'WY', ranks: [49, 49, 49, 49, 49, 50, 50, 51, 51, 51, 51] }
	];

	const years = [
		'1920',
		'1930',
		'1940',
		'1950',
		'1960',
		'1970',
		'1980',
		'1990',
		'2000',
		'2010',
		'2020'
	];
	const maxRank = 51;
	const rowHeight = 14;

	const data = years.map((year, i) => {
		const row: Record<string, string | number> = { year };
		for (const state of states) {
			row[state.name] = state.ranks[i];
		}
		return row;
	});
	export { data };

	const keys = states.map((s) => s.name);

	let hoveredState = $state<string | null>(null);
</script>

<Chart
	{data}
	x="year"
	xScale={scalePoint()}
	y={keys}
	yScale={scaleLinear()}
	yDomain={[maxRank + 0.5, 0.5]}
	padding={{ top: 30, bottom: 30, left: 14, right: 18 }}
	height={maxRank * rowHeight + 60}
>
	{#snippet children({ context })}
		<Layer>
			<LinearGradient
				id="gradient-improved"
				stops={['var(--color-success-700)', 'var(--color-success-300)']}
			/>
			<LinearGradient
				id="gradient-declined"
				stops={['var(--color-danger-300)', 'var(--color-danger-700)']}
			/>

			<Axis placement="top" rule={false} />
			<Axis placement="bottom" rule={false} />

			<!-- Lines (one Spline per state) -->
			{#each states as state (state.name)}
				{@const dimmed = hoveredState !== null && hoveredState !== state.name}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<g
					onmouseenter={() => (hoveredState = state.name)}
					class={cls('transition-opacity duration-200', dimmed && 'opacity-[0.15]')}
				>
					<Spline
						y={state.name}
						curve={curveBumpX}
						stroke={(d, i, arr) => {
							if (i >= arr.length - 1)
								return 'color-mix(in srgb, var(--color-surface-content) 30%, transparent)';
							const from = d[state.name];
							const to = arr[i + 1][state.name];
							return from > to
								? 'url(#gradient-improved)'
								: from < to
									? 'url(#gradient-declined)'
									: 'color-mix(in srgb, var(--color-surface-content) 30%, transparent)';
						}}
						strokeWidth={4}
					/>
				</g>
			{/each}

			<!-- Labels at each point -->
			{#each states as state (state.name)}
				{@const dimmed = hoveredState !== null && hoveredState !== state.name}
				{#each data as point, i (point.year)}
					{@const x = context.xScale(point.year)}
					{@const y = context.yScale(point[state.name])}
					{@const from = state.ranks[i === 0 ? 0 : i - 1]}
					{@const to = state.ranks[i === 0 ? 1 : i]}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<rect
						x={x - 12}
						y={y - rowHeight / 2}
						width={24}
						height={rowHeight}
						class={cls('fill-surface-200 transition-opacity duration-200', dimmed && '_opacity-10')}
						onmouseenter={() => (hoveredState = state.name)}
						onmouseleave={() => (hoveredState = null)}
					/>
					<text
						{x}
						{y}
						text-anchor="middle"
						dominant-baseline="central"
						pointer-events="none"
						class={cls(
							'text-[12px] font-semibold font-[monospace] transition-opacity duration-200',
							from > to ? 'fill-success' : from < to ? 'fill-danger' : 'fill-surface-content/50',
							dimmed && 'opacity-10'
						)}
					>
						{state.name}
					</text>
				{/each}
			{/each}
		</Layer>
	{/snippet}
</Chart>
