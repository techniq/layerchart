<script lang="ts">
	import { Arc, Chart, ClipPath, Layer, Text } from 'layerchart';
	import { SpringValue } from 'svelte-ux';
	import ArcControls from '$lib/components/controls/ArcControls.svelte';

	let value = $state(75);
	let segments = $state(60);

	export const data = { value, segments };
</script>

<ArcControls bind:value bind:segments />

<Chart height={240} padding={20}>
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
