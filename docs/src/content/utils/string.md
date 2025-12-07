---
description: Utility string functions.
category: tools
layers: []
related: [/docs/components/BarChart/duration-civilization-timeline, /docs/components/BarChart/duration-civilization-timeline-dense, /docs/components/Text/playground, components/Text, https://www.layerstack.dev/docs/utils/string]
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
 	import { truncate, toTitleCase } from '@layerstack/utils';
</script>

## Usage

### truncate

{truncate("This is a really long string of text.", 21)}

<Example component="string" name="truncate" resize={false} showcode />

### toTitleCase()

{toTitleCase("string of text")}

<Example component="string" name="toTitleCase" resize={false} showcode />