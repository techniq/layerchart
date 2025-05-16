<script lang="ts">
  import { MenuField } from 'svelte-ux';
  import type { ConnectorType } from '$lib/utils/connectorUtils.js';

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

<MenuField label="Connector Type" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
