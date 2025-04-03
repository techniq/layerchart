<script lang="ts">
  import { Field, RangeField, Switch, TextField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { Arc, Chart, Svg, LinearGradient, Text } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  let value = $state(50);
  // let value = 100;
  let domain = $state<[number, number]>([0, 100]);
  // let range = [-120, 120];
  let range = $state<[number, number]>([0, 360]);
  let innerRadius = $state(70);
  let outerRadius = $state(140);
  let cornerRadius = $state(8);
  let padAngle = $state(0);
  let padRadius = $state(0);

  let spring = $state(true);

  const labelOptions = [
    { name: 'None', value: undefined },
    { name: 'SVG Center', value: 'svg-center' },
    { name: 'Arc Center', value: 'arc-center' },
    { name: 'Arc Bottom', value: 'arc-bottom' },
    { name: 'Arc Centroid', value: 'arc-centroid' },
  ];
  let label = 'svg-center';

  let outerText = $state('outer text');
  let innerText = $state('inner text');
  let centroidText = $state('centroid text');
  let textPath = $state<'arc' | 'track'>('arc');
  let textSize = $state(16);
</script>

<h1>Playground</h1>

<div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-2">
  <RangeField label="Value" bind:value min={domain[0]} max={domain[1]} class="col-span-3" />
  <Field label="Use spring" let:id>
    <Switch bind:checked={spring} {id} />
  </Field>
  <RangeField label="Domain Min" bind:value={domain[0]} max={domain[1]} />
  <RangeField label="Domain Max" bind:value={domain[1]} max={1000} />
  <RangeField label="Range Min (degrees)" bind:value={range[0]} min={-360} max={360} />
  <RangeField label="Range Max (degrees)" bind:value={range[1]} min={-360} max={360} />
  <RangeField label="Inner radius" bind:value={innerRadius} max={outerRadius} />
  <RangeField label="Outer radius" bind:value={outerRadius} min={innerRadius} max={200} />
  <RangeField
    label="Corner radius"
    bind:value={cornerRadius}
    max={(outerRadius - innerRadius) / 2}
  />
  <RangeField label="Pad angle" bind:value={padAngle} max={2} step={0.1} />
  <!-- <RangeField label="Pad radius" bind:value={padRadius} max={2} step={0.1} /> -->
  <TextField label="Outer Arc Text" bind:value={outerText} />
  <TextField label="Inner Arc Text" bind:value={innerText} />
  <TextField label="Centroid Arc Text" bind:value={centroidText} />
  <Field label="textAnchor" classes={{ input: 'mt-[6px] mb-1' }}>
    <ToggleGroup bind:value={textPath} variant="outline" size="sm" inset class="w-full">
      <ToggleOption value="arc">arc</ToggleOption>
      <ToggleOption value="track">track</ToggleOption>
    </ToggleGroup>
  </Field>
  <RangeField label="Font size (px)" bind:value={textSize} min={domain[0]} max={domain[1]} />
</div>

<Preview>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart>
      <Svg center>
        {#key spring}
          <LinearGradient class="from-secondary to-primary" vertical>
            {#snippet children({ gradient })}
              <Arc
                {value}
                {domain}
                {range}
                {innerRadius}
                {outerRadius}
                {cornerRadius}
                {padAngle}
                motion={spring ? 'spring' : undefined}
                fill={gradient}
                track={{ class: 'fill-surface-content/5' }}
              >
                {#snippet children({ value, arcTextPaths, trackTextPaths })}
                  {@const paths = textPath === 'arc' ? arcTextPaths : trackTextPaths}
                  <Text
                    value={Math.round(value)}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    class="text-4xl"
                    dy={8}
                  />
                  <Text value={innerText} path={paths.inner} font-size="{textSize}px" truncate />
                  <Text value={outerText} path={paths.outer} font-size="{textSize}px" truncate />
                  <Text
                    value={centroidText}
                    path={paths.centroid}
                    font-size="{textSize}px"
                    truncate
                  />
                {/snippet}
              </Arc>
            {/snippet}
          </LinearGradient>
        {/key}
      </Svg>
    </Chart>
  </div>
</Preview>

{#if false}
  <h2>Label location</h2>

  <!-- {#if label === 'svg-center'}
	<text dy={16}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

  <!-- {#if label === 'arc-center'}
	<text x={labelArcCenterOffset.x} y={labelArcCenterOffset.y} dy={16}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

  <!-- {#if label === 'arc-bottom'}
	<text x={labelArcBottomOffset.x} y={labelArcBottomOffset.y} dy={0}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

  <!-- {#if label === 'arc-centroid'}
	<text x={trackArcCentroid[0]} y={trackArcCentroid[1]} dy={16}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

  <Preview>
    <div class="h-[200px] p-4 border rounded-sm">
      <Chart>
        <Svg center>
          <LinearGradient stops={['hsl(80, 100%, 50%)', 'hsl(200, 100%, 50%)']} vertical>
            {#snippet children({ gradient })}
              <Arc
                {value}
                {domain}
                {range}
                {innerRadius}
                {outerRadius}
                {cornerRadius}
                {padAngle}
                fill={gradient}
              >
                {#snippet children({ boundingBox })}
                  <!-- svg center -->
                  <!-- <Text
							value={Math.round(value)}
							textAnchor="middle"
							verticalAnchor="middle"
              class="text-4xl"
							dy={8}
						/> -->
                  <!-- arc center -->
                  <Text
                    value={Math.round(value)}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    class="text-4xl"
                    x={outerRadius - boundingBox.width / 2}
                    y={(outerRadius - boundingBox.height / 2) * -1}
                    dy={8}
                  />
                  <!-- <Text {value} textAnchor="middle" verticalAnchor="middle" class="text-4xl" capHeight="1.5rem" /> -->
                  <!-- <Text {value} textAnchor="middle" verticalAnchor="middle" class="text-7xl" capHeight="3.1em" /> -->
                {/snippet}
              </Arc>
            {/snippet}
          </LinearGradient>
        </Svg>
      </Chart>
    </div>
  </Preview>
{/if}
