<script lang="ts">
	import { Arc, ArcChart, Group, LinearGradient, Text } from 'layerchart';
</script>

<ArcChart height={140}>
	{#snippet marks()}
		<LinearGradient class="from-secondary to-primary">
			{#snippet children({ gradient })}
				<Group y={20}>
					<Arc
						value={70}
						domain={[0, 100]}
						outerRadius={80}
						innerRadius={-15}
						cornerRadius={10}
						range={[-120, 120]}
						fill={gradient}
						track={{ class: 'fill-none stroke-surface-content/10' }}
					>
						{#snippet children({ value })}
							<Text
								value={Math.round(value) + '%'}
								textAnchor="middle"
								verticalAnchor="middle"
								class="text-4xl tabular-nums"
							/>
						{/snippet}
					</Arc>
				</Group>
			{/snippet}
		</LinearGradient>
	{/snippet}
</ArcChart>
