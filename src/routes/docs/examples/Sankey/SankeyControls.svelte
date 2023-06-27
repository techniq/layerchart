<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Field, MenuField, ToggleGroup, ToggleOption } from 'svelte-ux';

  import RangeField from '$lib/docs/RangeField.svelte';
  import type Sankey from '$lib/components/Sankey.svelte';

  type SankeyProps = ComponentProps<Sankey>;

  export let nodeAlign: SankeyProps['nodeAlign'];
  export let nodeColorBy: 'layer' | 'depth' | 'height' | 'index';
  export let linkColorBy: 'static' | 'source' | 'target';
  export let nodePadding: number;
  export let nodeWidth: number;
</script>

<div class="grid grid-flow-col gap-1 mb-4">
  <MenuField
    label="Align"
    bind:value={nodeAlign}
    options={[
      { label: 'justify', value: 'justify' },
      { label: 'left', value: 'left' },
      { label: 'center', value: 'center' },
      { label: 'right', value: 'right' }
    ]}
  />

  <MenuField
    label="Node color"
    bind:value={nodeColorBy}
    options={[
      { label: 'layer', value: 'layer' },
      { label: 'depth', value: 'depth' },
      { label: 'height', value: 'height' },
      { label: 'index', value: 'index' }
    ]}
  />

  <MenuField
    label="Link color"
    bind:value={linkColorBy}
    options={[
      { label: 'static', value: 'static' },
      { label: 'source', value: 'source' },
      { label: 'target', value: 'target' }
    ]}
  />

  <RangeField label="Node Padding" bind:value={nodePadding} max={20} />
  <RangeField label="Node Width" bind:value={nodeWidth} max={20} />
</div>
