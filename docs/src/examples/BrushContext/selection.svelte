<script lang="ts">
	import { range } from 'd3-array';
	import { Axis, Chart, Circle, Layer, Points, type DomainType } from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	const data = range(200).map((d) => {
		return { x: d, y: Math.random() };
	});
	export { data };

	let xDomain = $state<DomainType>([null, null]);
	let yDomain = $state<DomainType>([null, null]);
</script>

<Chart
	{data}
	x="x"
	y="y"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	brush={{
		axis: 'both',
		onChange: (e) => {
			xDomain = e.xDomain;
			yDomain = e.yDomain;
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
						(xDomain?.[0] == null || xDomain?.[0] <= point.data.x) &&
						(xDomain?.[1] == null || point.data.x <= xDomain?.[1]) &&
						(yDomain?.[0] == null || yDomain?.[0] <= point.data.y) &&
						(yDomain?.[1] == null || point.data.y <= yDomain?.[1])}

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
