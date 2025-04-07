<script lang="ts">
  import { onMount } from 'svelte';
  import * as easings from 'svelte/easing';
  import { MenuField } from 'svelte-ux';
  import type { ConnectorType } from 'layerchart/utils/connectorUtils.js';

  let {
    value = $bindable('rounded'),
  }: {
    value?: ConnectorType;
  } = $props();

  const options = ['straight', 'square', 'beveled', 'rounded', 'd3'].map((type) => ({
    label: type,
    value: type,
  }));
</script>

<MenuField label="Path data" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
