---
description: Primitive component which adds custom text for labeling, annotation, or commentary.
section: primitives
layers: [svg, canvas, html]
related: []
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Usage

<Example name="playground" showCode />

## Along path

`Text` can be used with `Arc`'s `children` snippet and `getArcTextProps` to write along the `inner`, `outer`, or `middle` of the arc path.

The text will smartly orientate based on the direction (clockwise / counter-clockwise) and location (top, bottom, left, right) of the arc

<Example component="Arc" name="label-direction" />

<!-- ### Word wrap with explicit `\n`

<Example name="word-wrap-with-explicit-n" /> -->
