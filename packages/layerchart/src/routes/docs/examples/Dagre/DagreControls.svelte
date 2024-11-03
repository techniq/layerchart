<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { MenuField } from 'svelte-ux';
  import { curveLinear } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import type Dagre from '$lib/components/Dagre.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  type DagreProps = ComponentProps<Dagre>;

  export let settings = {
    ranker: 'network-simplex' as DagreProps['ranker'],
    direction: 'left-right' as DagreProps['direction'],
    align: 'up-left' as DagreProps['align'],
    rankSeparation: 50 as DagreProps['rankSeparation'],
    nodeSeparation: 50 as DagreProps['nodeSeparation'],
    edgeSeparation: 10 as DagreProps['rankSeparation'],
    edgeLabelPosition: 'center' as DagreProps['edgeLabelPosition'],
    edgeLabelOffset: 10 as DagreProps['edgeLabelOffset'],
    curve: curveLinear as ComponentProps<CurveMenuField>['value'],
  };
</script>

<div class={cls('grid gap-2', $$props.class)}>
  <MenuField
    label="Ranker"
    options={[
      { label: 'Network-Simplex', value: 'network-simplex' },
      { label: 'Tight tree', value: 'tight-tree' },
      { label: 'Longest path', value: 'longest-path' },
    ]}
    bind:value={settings.ranker}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Direction"
    options={[
      { label: 'Top → Bottom', value: 'top-bottom' },
      { label: 'Bottom → Top', value: 'bottom-top' },
      { label: 'Left → Right', value: 'left-right' },
      { label: 'Right → Left', value: 'right-left' },
    ]}
    bind:value={settings.direction}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Align"
    options={[
      { label: 'None', value: 'none' },
      { label: 'Up / Left', value: 'up-left' },
      { label: 'Up / Right', value: 'up-right' },
      { label: 'Down / Left', value: 'down-left' },
      { label: 'Down / Right', value: 'down-right' },
    ]}
    bind:value={settings.align}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Rank separation"
    options={[
      { label: 'Compact', value: 10 },
      { label: 'Default', value: 50 },
      { label: 'Comfortable', value: 100 },
    ]}
    bind:value={settings.rankSeparation}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Node separation"
    options={[
      { label: 'Compact', value: 10 },
      { label: 'Default', value: 50 },
      { label: 'Comfortable', value: 100 },
    ]}
    bind:value={settings.nodeSeparation}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Edge separation"
    options={[
      { label: 'Compact', value: 5 },
      { label: 'Default', value: 10 },
      { label: 'Comfortable', value: 20 },
    ]}
    bind:value={settings.edgeSeparation}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Edge label position"
    options={[
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ]}
    bind:value={settings.edgeLabelPosition}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Edge label offset"
    options={[
      { label: 'Compact', value: 5 },
      { label: 'Default', value: 10 },
      { label: 'Comfortable', value: 20 },
    ]}
    bind:value={settings.edgeLabelOffset}
    menuIcon=""
    stepper
    dense
  />

  <CurveMenuField label="Curve style" bind:value={settings.curve} dense />
</div>
