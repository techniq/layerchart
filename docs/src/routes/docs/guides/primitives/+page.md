<script lang="ts">
  import { allComponents } from 'content-collections';
  import ComponentLink from '$lib/components/ComponentLink.svelte';

  let primitiveComponents = allComponents.filter(c => c.section === 'primitives');
</script>

# Primitives

A collection of components which support rendering within different layer types including `Svg`, `Canvas`, or `Html`.

Support for each layer type is dependent on the primitive's feature needs and capabilities of the layer type.

Primitives are also motion-enabled, providing tween or spring based transitions of location (x/y) and dimensions (width/height).

<div class="grid grid-cols-sm gap-3 mt-8">
{#each primitiveComponents as component}
  <ComponentLink
    component={component.name}
    example={component.usageExample}
    aspect="screenshot"
    supportedLayers={component.layers}
  />
{/each}
</div>
