<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { Field, RangeField, SpringValue, Switch, Toggle, cls, round } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import { Chart, Svg } from 'layerchart';
  import Arc from '$lib/components/Arc.svelte';
  import Group from '$lib/components/Group.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { radiansToDegrees } from '$lib/utils/math.js';

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

<h2>Partial Arc</h2>

<div class="mb-2">
  <RangeField label="Value" bind:value />
</div>
<Preview>
  <div class="h-[120px] p-4 border rounded">
    <Chart>
      <Svg>
        <Group center>
          <Group y={16}>
            <LinearGradient class="from-secondary to-primary" let:url>
              <Arc
                {value}
                range={[-120, 120]}
                outerRadius={60}
                innerRadius={50}
                cornerRadius={5}
                spring
                let:value
                fill={url}
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
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Concentric</h2>

<Preview>
  <div class="h-[200px] p-4 border rounded">
    <Chart>
      <Svg>
        <Group center>
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
        </Group>
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
  <div class="h-[240px] p-4 border rounded bg-neutral-900">
    <Chart>
      <Svg>
        <Group center>
          {#each { length: segments } as _, segmentIndex}
            {@const segmentAngle = (2 * Math.PI) / segments}
            {@const startAngle = segmentIndex * segmentAngle}
            {@const endAngle = (segmentIndex + 1) * segmentAngle}
            <SpringValue {value} let:value>
              <Arc
                {startAngle}
                {endAngle}
                innerRadius={-20}
                cornerRadius={4}
                padAngle={0.02}
                class={cls(
                  (segmentIndex / segments) * 100 < value ? 'fill-emerald-300' : 'fill-gray-700'
                )}
              >
                <Text
                  value={Math.round(value)}
                  textAnchor="middle"
                  verticalAnchor="middle"
                  dy={16}
                  class="text-6xl tabular-nums fill-white"
                />
              </Arc>
            </SpringValue>
          {/each}
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Color wheel</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart let:tooltip>
      <Svg>
        <Group center>
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
                on:pointermove={(e) => tooltip?.show(e, color)}
                on:pointerleave={(e) => tooltip?.hide()}
              />
            {/each}
          {/each}
        </Group>
      </Svg>
      <Tooltip header={(data) => data} />
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
    <div class="h-[200px] p-4 border rounded">
      <Chart>
        <Svg>
          <Group center>
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
          </Group>
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>
