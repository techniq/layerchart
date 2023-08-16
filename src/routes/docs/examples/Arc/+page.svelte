<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { Field, Switch, Toggle } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Arc from '$lib/components/Arc.svelte';
  import Group from '$lib/components/Group.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';
  import Text from '$lib/components/Text.svelte';
  import RangeField from '$lib/docs/RangeField.svelte';

  let value = 75;
</script>

<h1>Examples</h1>

<h2>Partial Arc</h2>

<div class="mb-2">
  <RangeField label="Value" bind:value />
</div>
<Preview>
  <div class="h-[200px] p-4 border rounded">
    <Chart>
      <Svg>
        <Group center>
          <LinearGradient from="hsl(80 100% 50%)" to="hsl(200 100% 50%)" let:url>
            <Arc
              {value}
              range={[-120, 120]}
              outerRadius={60}
              innerRadius={50}
              cornerRadius={5}
              spring
              let:value
              fill={url}
              track={{ fill: 'none', stroke: 'hsl(0 0% 0% / 10%)' }}
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
  <div class="h-[200px] p-4 border rounded">
    <Chart>
      <Svg>
        <Group center>
          <Arc
            value={40}
            innerRadius={-20}
            cornerRadius={10}
            class="fill-red-500"
            track={{ class: 'fill-red-100' }}
          />
          <Arc
            value={60}
            outerRadius={-25}
            innerRadius={-20}
            cornerRadius={10}
            class="fill-lime-400"
            track={{ class: 'fill-lime-100' }}
          />
          <Arc
            value={80}
            outerRadius={-50}
            innerRadius={-20}
            cornerRadius={10}
            class="fill-cyan-400"
            track={{ class: 'fill-cyan-100' }}
          />
        </Group>
      </Svg>
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
                track={{ class: 'fill-red-100' }}
                tweened={{ duration: 1000, easing: cubicInOut }}
              />
              <Arc
                initialValue={0}
                value={60}
                outerRadius={-25}
                innerRadius={-20}
                cornerRadius={10}
                class="fill-lime-400"
                track={{ class: 'fill-lime-100' }}
                tweened={{ duration: 1000, easing: cubicInOut }}
              />
              <Arc
                initialValue={0}
                value={80}
                outerRadius={-50}
                innerRadius={-20}
                cornerRadius={10}
                class="fill-cyan-400"
                track={{ class: 'fill-cyan-100' }}
                tweened={{ duration: 1000, easing: cubicInOut }}
              />
            {/if}
          </Group>
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>
