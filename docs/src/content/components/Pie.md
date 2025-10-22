---
description: Pie
section: marks
layers: ['svg', 'canvas']
related: ['components/Arc', 'examples/Arc']
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Basic

<Example name="basic" />

### Disable sorting

<Example name="disable-sorting" />

### Partial range (Chart xRange)

<Example name="partial-range-chart-xrange" />

### Partial range (range prop)

<Example name="partial-range-range-prop" />

### Pad angle

<Example name="pad-angle" />

### Pad angle (with inner radius)

<Example name="pad-angle-with-inner-radius" />

### Inner radius

#### If value >= 1, value will be treated as discrete

<Example name="inner-radius-positive" />

#### If value >= 0 and less than 1, value will be treated as a percentage of outerRadius
 
<Example name="inner-radius-zero-one" />

#### If value less than 0, value will be treated as a offset of outerRadius

<Example name="inner-radius-negative" />

### Outer radius

<Example name="outer-radius" />

### Multiple (data prop)

<Example name="multiple-data-prop" />

### Tweened

<Example name="tweened" />

### Offset

<Example name="offset" />

### default slot / render each Arc

<Example name="default-slot-render-each-arc" />

### Labels

#### Centroid

<Example name="labels-centroid" />

#### Centroid (multiple)

<Example name="labels-centroid-multiple" />

### Outer

<Example name="labels-outer" />

### Outer (with padding)

<Example name="labels-outer-with-padding" />

### Outer Radial

<Example name="labels-outer-radial" />

### Tooltip

<Example name="tooltip" />

### Tooltip with Arcs (slot)

<Example name="tooltip-with-arcs-slot" />

### Placement

#### Left

<Example name="placement-left" />

#### Center

<Example name="placement-center" />

#### Right

<Example name="placement-right" />
