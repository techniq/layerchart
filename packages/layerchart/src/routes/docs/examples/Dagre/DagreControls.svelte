<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { MenuField } from 'svelte-ux';
  import { curveLinear } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import type Dagre from '$lib/components/Dagre.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  type DagreProps = ComponentProps<Dagre>;

  export let ranker: DagreProps['ranker'] = 'network-simplex';
  export let direction: DagreProps['direction'] = 'left-right';
  export let align: DagreProps['align'] = 'up-left';
  export let rankSeparation: DagreProps['rankSeparation'] = 50;
  export let nodeSeparation: DagreProps['nodeSeparation'] = 50;
  export let edgeSeparation: DagreProps['rankSeparation'] = 10;
  export let curve: ComponentProps<CurveMenuField>['value'] = curveLinear;
</script>

<div class={cls('grid gap-2', $$props.class)}>
  <MenuField
    label="Ranker"
    options={[
      { label: 'Network-Simplex', value: 'network-simplex' },
      { label: 'Tight tree', value: 'tight-tree' },
      { label: 'Longest path', value: 'longest-path' },
    ]}
    bind:value={ranker}
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
    bind:value={direction}
    menuIcon=""
    stepper
    dense
  />

  <MenuField
    label="Align"
    options={[
      { label: 'Up / Left', value: 'up-left' },
      { label: 'Up / Right', value: 'up-right' },
      { label: 'Down / Left', value: 'down-left' },
      { label: 'Down / Right', value: 'down-right' },
    ]}
    bind:value={align}
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
    bind:value={rankSeparation}
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
    bind:value={nodeSeparation}
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
    bind:value={edgeSeparation}
    menuIcon=""
    stepper
    dense
  />

  <CurveMenuField label="Curve style" bind:value={curve} dense />
</div>
