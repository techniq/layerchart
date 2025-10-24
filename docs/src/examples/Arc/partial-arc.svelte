<script lang="ts">
	import { Arc, Chart, Group, Layer, LinearGradient, Text } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let value = $state(75);
	const data = { value };

	export { data };
</script>

<div class="mb-2">
	<RangeField label="Value" bind:value />
</div>
<Chart height={120}>
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
