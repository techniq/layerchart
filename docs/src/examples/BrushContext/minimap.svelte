<script lang="ts">
	import { range } from 'd3-array';
	import { Axis, Chart, ChartClipPath, Circle, Layer, Points } from 'layerchart';
	import { State } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());

	const randomData = range(200).map((d) => {
		return { x: d, y: Math.random() };
	});

	export { data };
</script>

<State initial={{ xDomain: [null, null], yDomain: [null, null] }} let:value let:set>
	<div class="relative">
		<div class="p-4 border rounded-sm">
			<Chart
				{data}
				x="x"
				xDomain={value?.xDomain}
				y="y"
				yDomain={value?.yDomain}
				yNice
				padding={{ left: 16, bottom: 24 }}
				brush={{
					axis: 'both',
					resetOnEnd: true,
					onBrushEnd: (e) => {
						set({
							// @ts-expect-error
							xDomain: e.xDomain,
							// @ts-expect-error
							yDomain: e.yDomain
						});
					}
				}}
				height={400}
			>
				<Layer>
					<Axis placement="left" grid rule />
					<Axis placement="bottom" rule />

					<ChartClipPath>
						<Points class="fill-primary/30 stroke-primary" r={4} />
					</ChartClipPath>
				</Layer>
			</Chart>
		</div>

		<div class="absolute top-0 right-0 w-[25%] h-[25%] border rounded-sm bg-surface-100">
			<Chart
				data={randomData}
				x="x"
				y="y"
				yNice
				brush={{
					axis: 'both',
					mode: 'separated',
					xDomain: value?.xDomain,
					yDomain: value?.yDomain,
					onChange: (e) => {
						set({
							// @ts-expect-error
							xDomain: e.xDomain,
							// @ts-expect-error
							yDomain: e.yDomain
						});
					}
				}}
			>
				<Layer>
					<Points>
						{#snippet children({ points })}
							{#each points as point}
								{@const isSelected =
									value &&
									(value.xDomain?.[0] == null || value.xDomain?.[0] <= point.data.x) &&
									(value.xDomain?.[1] == null || point.data.x <= value.xDomain?.[1]) &&
									(value.yDomain?.[0] == null || value.yDomain?.[0] <= point.data.y) &&
									(value.yDomain?.[1] == null || point.data.y <= value.yDomain?.[1])}

								<Circle
									cx={point.x}
									cy={point.y}
									r={0.5}
									class={cls(
										isSelected
											? 'fill-primary/30 stroke-primary'
											: 'fill-surface-content/10 stroke-neutral'
									)}
									motion="spring"
								/>
							{/each}
						{/snippet}
					</Points>
				</Layer>
			</Chart>
		</div>
	</div>
</State>
