<script lang="ts">
  import Chart from '../components/Chart.svelte';
  import Layer from '../components/layers/Layer.svelte';
  import Rect from '../components/Rect/Rect.svelte';
  import Circle from '../components/Circle/Circle.svelte';
  import Ellipse from '../components/Ellipse/Ellipse.svelte';
  import Line from '../components/Line/Line.svelte';
  import Group from '../components/Group/Group.svelte';
  import Text from '../components/Text/Text.svelte';
  import Path from '../components/Path/Path.svelte';

  type Primitive = 'rect' | 'circle' | 'ellipse' | 'line' | 'group' | 'text' | 'path';
  type Mode = 'layerchart' | 'native';

  type Props = {
    primitive: Primitive;
    mode: Mode;
    count?: number;
  };

  let { primitive, mode, count = 100 }: Props = $props();
</script>

{#if mode === 'layerchart'}
  <Chart width={500} height={300}>
    <Layer type="svg">
      {#each Array(count) as _, i (i)}
        {#if primitive === 'rect'}
          <Rect x={10} y={10} width={50} height={30} fill="steelblue" />
        {:else if primitive === 'circle'}
          <Circle cx={30} cy={30} r={15} fill="steelblue" />
        {:else if primitive === 'ellipse'}
          <Ellipse cx={30} cy={30} rx={20} ry={10} fill="steelblue" />
        {:else if primitive === 'line'}
          <Line x1={0} y1={0} x2={50} y2={50} stroke="steelblue" strokeWidth={2} />
        {:else if primitive === 'group'}
          <Group x={10} y={10} />
        {:else if primitive === 'text'}
          <Text x={10} y={20} value="Hello" fill="steelblue" />
        {:else if primitive === 'path'}
          <Path pathData="M0,0 L50,50 L100,0 Z" fill="none" stroke="steelblue" strokeWidth={2} />
        {/if}
      {/each}
    </Layer>
  </Chart>
{:else}
  <svg width={500} height={300}>
    {#each Array(count) as _, i (i)}
      {#if primitive === 'rect'}
        <rect x={10} y={10} width={50} height={30} fill="steelblue" />
      {:else if primitive === 'circle'}
        <circle cx={30} cy={30} r={15} fill="steelblue" />
      {:else if primitive === 'ellipse'}
        <ellipse cx={30} cy={30} rx={20} ry={10} fill="steelblue" />
      {:else if primitive === 'line'}
        <line x1={0} y1={0} x2={50} y2={50} stroke="steelblue" stroke-width={2} />
      {:else if primitive === 'group'}
        <g transform="translate(10,10)"></g>
      {:else if primitive === 'text'}
        <text x={10} y={20} fill="steelblue">Hello</text>
      {:else if primitive === 'path'}
        <path d="M0,0 L50,50 L100,0 Z" fill="none" stroke="steelblue" stroke-width={2} />
      {/if}
    {/each}
  </svg>
{/if}
