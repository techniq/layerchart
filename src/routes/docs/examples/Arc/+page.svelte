<script lang="ts">
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
        <LinearGradient id="arcGradient2" from="hsl(80 100% 50%)" to="hsl(200 100% 50%)" />
        <Group center>
          <Arc
            {value}
            range={[-120, 120]}
            outerRadius={60}
            innerRadius={50}
            cornerRadius={5}
            spring
            let:value
            fill="url(#arcGradient2)"
            track={{ fill: 'none', stroke: 'hsl(0 0% 0% / 10%)' }}
          >
            <Text
              value={Math.round(value) + '%'}
              textAnchor="middle"
              verticalAnchor="middle"
              class="text-3xl tabular-nums"
            />
          </Arc>
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
