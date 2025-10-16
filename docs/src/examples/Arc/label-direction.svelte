<script lang="ts">
	import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';

	let value = $state(60);
	let domain = $state<[number, number]>([0, 100]);
	let cornerRadius = $state(8);

	let spring = $state(true);

	let outerText = $state('outer text');
	let innerText = $state('inner text');
	let centroidText = $state('centroid text');

	const labelExamples: Array<{ label: string; range: [number, number] }> = [
		{
			label: 'top cw',
			range: [-90, 90]
		},
		{
			label: 'top ccw',
			range: [90, -90]
		},
		{
			label: 'bottom cw',
			range: [-270, -90]
		},
		{
			label: 'bottom ccw',
			range: [-90, -270]
		},

		{
			label: 'left cw',
			range: [-180, 0]
		},
		{
			label: 'left ccw',
			range: [0, -180]
		},
		{
			label: 'right cw',
			range: [0, 180]
		},
		{
			label: 'right ccw',
			range: [180, 0]
		}
	];
</script>

<div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-2">
	{#each labelExamples as example}
		<div class="p-4 border rounded-sm">
			<Chart height={300}>
				<Layer center>
					<LinearGradient class="from-secondary to-primary" vertical>
						{#snippet children({ gradient })}
							<Arc
								{value}
								{domain}
								range={example.range}
								{cornerRadius}
								innerRadius={0.5}
								fill={gradient}
								track={{ class: 'fill-surface-content/5' }}
							>
								{#snippet children({ getArcTextProps, getTrackTextProps })}
									<Text
										value={example.label}
										textAnchor="middle"
										verticalAnchor="middle"
										class="text-xs"
										dy={-8}
									/>
									<Text
										value={example.range.join(',')}
										textAnchor="middle"
										verticalAnchor="middle"
										class="text-xs"
										dy={8}
									/>

									<!-- Arc Text -->
									<Text {...getArcTextProps('inner')} value={innerText} font-size="12px" truncate />
									<Text {...getArcTextProps('outer')} value={outerText} font-size="12px" truncate />
									<Text
										{...getArcTextProps('middle')}
										value={centroidText}
										font-size="12px"
										truncate
									/>
								{/snippet}
							</Arc>
						{/snippet}
					</LinearGradient>
				</Layer>
			</Chart>
		</div>
	{/each}
</div>
