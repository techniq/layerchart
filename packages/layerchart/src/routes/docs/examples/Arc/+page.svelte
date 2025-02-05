<script lang="ts">
  import { cubicInOut } from 'svelte/easing';

  import {
    Arc,
    Chart,
    ClipPath,
    Group,
    LinearGradient,
    Svg,
    Text,
    Tooltip,
    radiansToDegrees,
  } from 'layerchart';
  import { Field, RangeField, SpringValue, Switch, Toggle } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';
  import { round } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';

  let value = 75;
  let segments = 60;

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
</script>

<h1>Examples</h1>

<Blockquote>
  See also: <a href="/docs/components/PieChart">PieChart</a> for simplified examples
</Blockquote>

<h2>Partial Arc</h2>

<div class="mb-2">
  <RangeField label="Value" bind:value />
</div>
<Preview>
  <div class="h-[120px] p-4 border resize overflow-auto">
    <Chart>
      <Svg center>
        <Group y={16}>
          <LinearGradient class="from-secondary to-primary" let:gradient>
            <Arc
              {value}
              range={[-120, 120]}
              outerRadius={60}
              innerRadius={50}
              cornerRadius={5}
              spring
              let:value
              fill={gradient}
              track={{ class: 'fill-none stroke-surface-content/10' }}
            >
              <Text
                value={Math.round(value) + '%'}
                textAnchor="middle"
                verticalAnchor="middle"
                class="text-3xl tabular-nums"
              />
            </Arc>
          </LinearGradient>
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Concentric</h2>

<Preview>
  <div class="h-[200px] p-4 border resize overflow-auto">
    <Chart>
      <Svg center>
        <Arc
          value={400}
          domain={[0, 1000]}
          innerRadius={-20}
          cornerRadius={10}
          class="fill-red-500"
          track={{ class: 'fill-red-500/10' }}
        />
        <Arc
          value={20}
          domain={[0, 30]}
          outerRadius={-25}
          innerRadius={-20}
          cornerRadius={10}
          class="fill-lime-400"
          track={{ class: 'fill-lime-400/10' }}
        />
        <Arc
          value={10}
          domain={[0, 12]}
          outerRadius={-50}
          innerRadius={-20}
          cornerRadius={10}
          class="fill-cyan-400"
          track={{ class: 'fill-cyan-500/10' }}
        />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Segmented Arc</h2>

<div class="grid grid-flow-col gap-3 mb-2">
  <RangeField label="Value" bind:value />
  <RangeField label="Segments" bind:value={segments} min={2} />
</div>
<Preview>
  <div class="h-[240px] p-4 border resize overflow-auto">
    <Chart>
      <Svg center>
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
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Segmented Arc (clip/mask)</h2>

<div class="grid grid-flow-col gap-3 mb-2">
  <RangeField label="Value" bind:value />
  <RangeField label="Segments" bind:value={segments} min={2} />
</div>
<Preview>
  <div class="h-[240px] p-4 border resize overflow-auto">
    <Chart>
      <Svg center>
        <ClipPath>
          <svelte:fragment slot="clip">
            <SpringValue {value} let:value>
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
            </SpringValue>
          </svelte:fragment>
          <Arc
            {value}
            innerRadius={-20}
            spring
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
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Color wheel</h2>

<Preview>
  <div class="h-[300px] p-4 border resize overflow-auto">
    <Chart let:tooltip>
      <Svg center>
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
              onpointermove={(e) => tooltip?.show(e, color)}
              onpointerleave={(e) => tooltip?.hide()}
            />
          {/each}
        {/each}
      </Svg>
      <Tooltip.Root let:data>
        {data}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Tween value on mount</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview>
    <div class="h-[200px] p-4 border resize overflow-auto">
      <Chart>
        <Svg center>
          {#if show}
            <Arc
              initialValue={0}
              value={40}
              innerRadius={-20}
              cornerRadius={10}
              class="fill-red-500"
              track={{ class: 'fill-red-500/10' }}
              tweened={{ duration: 1000, easing: cubicInOut }}
            />
            <Arc
              initialValue={0}
              value={60}
              outerRadius={-25}
              innerRadius={-20}
              cornerRadius={10}
              class="fill-lime-400"
              track={{ class: 'fill-lime-400/10' }}
              tweened={{ duration: 1000, easing: cubicInOut }}
            />
            <Arc
              initialValue={0}
              value={80}
              outerRadius={-50}
              innerRadius={-20}
              cornerRadius={10}
              class="fill-cyan-400"
              track={{ class: 'fill-cyan-500/10' }}
              tweened={{ duration: 1000, easing: cubicInOut }}
            />
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>
