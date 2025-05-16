<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import JsonTree from 'svelte-json-tree';
  import { cls } from '@layerstack/tailwind';

  const {
    value,
    defaultExpandedPaths = ['$'],
    class: className,
  }: {
    value: ComponentProps<JsonTree>['value'];
    defaultExpandedPaths?: ComponentProps<JsonTree>['defaultExpandedPaths'];
    class?: string;
  } = $props();
</script>

<div class={cls('overflow-auto px-4 py-2 bg-[#1e1e1e]', className)}>
  <JsonTree
    {value}
    {defaultExpandedPaths}
    shouldTreatIterableAsObject
    --json-tree-property-color="#72a2d3"
    --json-tree-string-color="#6cd1c7"
    --json-tree-symbol-color="#6cd1c7"
    --json-tree-boolean-color="#9681f7"
    --json-tree-function-color="#e59b6f"
    --json-tree-number-color="#9681f7"
    --json-tree-label-color="#9ca0a5"
    --json-tree-arrow-color="#e8eaed"
    --json-tree-null-color="#81868a"
    --json-tree-undefined-color="#81868a"
    --json-tree-date-color="#9ca0a5"
    --json-tree-operator-color="#e8eaed"
    --json-tree-regex-color="#6cd1c7"
  />
</div>
