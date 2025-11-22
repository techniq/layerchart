<script lang="ts">
	import { Arc, Chart, Layer, Text } from 'layerchart';
	import { SpringValue } from 'svelte-ux';
	import ArcControls from '$lib/components/controls/ArcControls.svelte';
	import { cls } from '@layerstack/tailwind';

	let value = $state(75);
	let segments = $state(60);

	export const data = { value, segments };
</script>

<ArcControls bind:value bind:segments />

<Chart height={240} padding={20}>
	<Layer center>
		<SpringValue {value} let:value>
			{#each { length: segments } as _, segmentIndex}
				{@const segmentAngle = (2 * Math.PI) / segments}
				<Arc
					startAngle={segmentIndex * segmentAngle}
					endAngle={(segmentIndex + 1) * segmentAngle}
					innerRadius={-20}
					cornerRadius={4}
					padAngle={0.02}
					class={cls(
						(segmentIndex / segments) * 100 < (value ?? 0)
							? 'fill-success-300'
							: 'fill-surface-content/10'
					)}
				/>
			{/each}

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
