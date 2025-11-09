<script lang="ts">
	import { Arc, Chart, Layer, Tooltip, radiansToDegrees } from 'layerchart';
	import { round } from '@layerstack/utils';

	// color wheel
	const layerCount = 6;
	const divisions = 12;

	function wheelSegmentColor(
		startAngle: number, // in radians
		layer: number,
		type: 'saturation' | 'lightness' | 'alpha' = 'alpha'
	) {
		const angle = Math.round(radiansToDegrees(startAngle));
		switch (type) {
			case 'saturation':
				return `hsla(${angle}, ${Math.round((layer / layerCount) * 100)}%, 50%, 1)`;
			case 'lightness':
				return `hsla(${angle}, 100%, ${100 - 10 * layer}%, 1)`;
			case 'alpha':
				return `hsla(${angle}, 100%, 50%, ${round(layer / layerCount, 2)})`;
		}
	}

	const data = { layerCount, divisions };

	export { data };
</script>

<Chart height={300} padding={20}>
	{#snippet children({ context })}
		<Layer center>
			{#each { length: layerCount } as _, layerIndex}
				{@const layer = layerIndex + 1}
				{#each { length: divisions } as _, segmentIndex}
					{@const segmentAngle = (2 * Math.PI) / divisions}
					{@const startAngle = segmentIndex * segmentAngle}
					{@const endAngle = (segmentIndex + 1) * segmentAngle}
					{@const color = wheelSegmentColor(startAngle, layer)}
					<Arc
						{startAngle}
						{endAngle}
						outerRadius={layer / layerCount}
						innerRadius={-20}
						cornerRadius={4}
						padAngle={0.02}
						fill={color}
						class="hover:scale-90 origin-center [transform-box:fill-box] transition-transform"
						onpointermove={(e) => context.tooltip.show(e, color)}
						onpointerleave={() => context.tooltip.hide()}
					/>
				{/each}
			{/each}
		</Layer>
		<Tooltip.Root>
			{#snippet children({ data })}
				{data}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
