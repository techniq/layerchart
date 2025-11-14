<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { MenuField } from 'svelte-ux';
  import { curveLinear } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import type Dagre from '$lib/components/Dagre.svelte';
  import type Spline from '$lib/components/Spline.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  type DagreProps = ComponentProps<typeof Dagre>;

  let {
    settings = $bindable({
      ranker: 'network-simplex',
      direction: 'left-right',
      align: 'up-left',
      rankSeparation: 50,
      nodeSeparation: 50,
      edgeSeparation: 10,
      edgeLabelPosition: 'center',
      edgeLabelOffset: 10,
      curve: curveLinear,
      arrow: 'arrow',
    }),
    class: className,
  }: {
    settings: {
      ranker: DagreProps['ranker'];
      direction: DagreProps['direction'];
      align: DagreProps['align'];
      rankSeparation: DagreProps['rankSeparation'];
      nodeSeparation: DagreProps['nodeSeparation'];
      edgeSeparation: DagreProps['rankSeparation'];
      edgeLabelPosition: DagreProps['edgeLabelPosition'];
      edgeLabelOffset: DagreProps['edgeLabelOffset'];
      curve: ComponentProps<typeof CurveMenuField>['value'];
      arrow: ComponentProps<typeof Spline>['marker'];
    };
    class?: string;
  } = $props();
</script>

<div class={cls('grid gap-2', className)}>
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
  <MenuField
    label="Arrow / Marker"
    options={[
      { label: 'arrow', value: 'arrow' },
      { label: 'triangle', value: 'triangle' },
      { label: 'circle', value: 'circle' },
      { label: 'circle-stroke', value: 'circle-stroke' },
      { label: 'dot', value: 'dot' },
      { label: 'line', value: 'line' },
    ]}
    bind:value={settings.arrow}
    menuIcon=""
    stepper
    dense
  />
</div>
