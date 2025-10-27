<script lang="ts">
	import { Arc, Chart, ClipPath, Layer, Text } from 'layerchart';
	import { RangeField, SpringValue } from 'svelte-ux';

	let value = $state(75);
	let segments = $state(60);
	const data = { value, segments };

	export { data };
</script>

<div class="grid grid-flow-col gap-3 mb-2">
	<RangeField label="Value" bind:value />
	<RangeField label="Segments" bind:value={segments} min={2} />
</div>
<Chart height={240}>
	<Layer center>
		<SpringValue {value} let:value>
			<ClipPath>
				{#snippet clip()}
					{#each { length: segments } as _, segmentIndex}
						{@const segmentAngle = (2 * Math.PI) / segments}
						<Arc
							startAngle={segmentIndex * segmentAngle}
							endAngle={(segmentIndex + 1) * segmentAngle}
							innerRadius={-20}
							cornerRadius={4}
							padAngle={0.02}
						/>
					{/each}
				{/snippet}
				<Arc
					value={value ?? 0}
					innerRadius={-20}
					motion="spring"
					class="fill-success-300"
					track={{ class: 'fill-surface-content/10' }}
				/>
			</ClipPath>

			<Text
				value={Math.round(value ?? 0)}
				textAnchor="middle"
				verticalAnchor="middle"
				dy={16}
				class="text-6xl tabular-nums"
			/>
		</SpringValue>
	</Layer>
</Chart>
