<script lang="ts">
	import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';

	let value = $state(60);
	let domain = $state<[number, number]>([0, 100]);
	let cornerRadius = $state(8);
	let outerText = $state('Outer Text');
	let innerText = $state('Inner Text');
	let centroidText = $state('Centroid Text');

	const labelExamples: Array<{ label: string; range: [number, number] }> = [
		{
			label: 'Top CW',
			range: [-90, 90]
		},
		{
			label: 'Top CCW',
			range: [90, -90]
		},
		{
			label: 'Bottom CW',
			range: [-270, -90]
		},
		{
			label: 'Bottom CCW',
			range: [-90, -270]
		},

		{
			label: 'Left CW',
			range: [-180, 0]
		},
		{
			label: 'Left CCW',
			range: [0, -180]
		},
		{
			label: 'Right CW',
			range: [0, 180]
		},
		{
			label: 'Right CCW',
			range: [180, 0]
		}
	];

	export const data = { value, labelExamples };
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">
	{#each labelExamples as example}
		<div class="px-4 py-1 border rounded-sm">
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
										value={example.range.map((r) => r + '°').join(', ')}
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
										class="fill-black"
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
