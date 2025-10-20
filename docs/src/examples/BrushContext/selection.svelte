<script lang="ts">
	import { range } from 'd3-array';
	import { Axis, Chart, Circle, Layer, Points } from 'layerchart';
	import { State } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	let { data } = $props();

	const randomData = range(200).map((d) => {
		return { x: d, y: Math.random() };
	});

	export { data };
</script>

<State initial={{ xDomain: [null, null], yDomain: [null, null] }} let:value let:set>
	<div class="p-4 border rounded-sm">
		<Chart
			data={randomData}
			x="x"
			y="y"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
			brush={{
				axis: 'both',
				onChange: (e) => {
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
								r={isSelected ? 4 : 2}
								class={cls(
									isSelected ? 'fill-primary/30 stroke-primary' : 'fill-neutral/10 stroke-neutral'
								)}
								motion="spring"
							/>
						{/each}
					{/snippet}
				</Points>
			</Layer>
		</Chart>
	</div>
</State>
