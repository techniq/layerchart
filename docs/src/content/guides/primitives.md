---
title: Primitives
order: 3
---

<script lang="ts">
  import { allComponents } from 'content-collections';
  import ComponentLink from '$lib/components/ComponentLink.svelte';

  let primitiveComponents = allComponents.filter(c => c.category === 'primitives');
</script>

Primitives are foundational components which support rendering within different layer types including `Svg`, `Canvas`, or `Html`. These components can be used directly and are also used internally by many components.

## Features

- Styling using attributes (`fill`, `stroke`, etc), `style`, and `class` (including CSS variables and media queries)
- Pointer events (click, down, enter, move, leave, etc)
- Motion-enabled, providing tween and spring based transitions for location (x/y) and dimensions (width/height)

These features are available across all layer types (including `Canvas`).

## Layer support

Some primitives are not available in all layer types based on the primitive's needs and browser [capabilities](/docs/guides/layers).

LayerChart does provide extended support than what is natively possible in some cases. For example `Text` provides word wrapping in `Svg` and `Canvas` layers, and all primitives support pointer and css styling in `Canvas`).

## Components

<div class="grid grid-cols-sm gap-3 mt-8">
{#each primitiveComponents as component}
  <ComponentLink
    component={component.name}
    aspect="screenshot"
    supportedLayers={component.layers}
  />
{/each}
</div>
