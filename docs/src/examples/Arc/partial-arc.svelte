<script lang="ts">
	import { Arc, Chart, Group, Layer, LinearGradient, Text } from 'layerchart';
	import ArcControls from '$lib/components/ArcControls.svelte';

	let value = $state(75);

	export { value as data };
</script>

<ArcControls bind:value includeSegments={false} />
<Chart height={120} padding={20}>
	<Layer center>
		<Group y={16}>
			<LinearGradient class="from-secondary to-primary">
				{#snippet children({ gradient })}
					<Arc
						{value}
						range={[-120, 120]}
						outerRadius={60}
						innerRadius={50}
						cornerRadius={5}
						motion="spring"
						fill={gradient}
						track={{ class: 'fill-none stroke-surface-content/10' }}
					>
						{#snippet children({ value })}
							<Text
								value={Math.round(value) + '%'}
								textAnchor="middle"
								verticalAnchor="middle"
								class="text-3xl tabular-nums"
							/>
						{/snippet}
					</Arc>
				{/snippet}
			</LinearGradient>
		</Group>
	</Layer>
</Chart>
