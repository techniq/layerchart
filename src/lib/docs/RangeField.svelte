<script lang="ts">
  import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

  import { Button, Field } from 'svelte-ux';

  export let value: number;
  export let min = 0;
  export let max = 100;
  export let step = 1;
</script>

<Field let:id {...$$restProps}>
  <Button
    icon={mdiChevronLeft}
    on:click={() => (value -= value > min ? step : 0)}
    class="mr-2"
    size="sm"
  />
  <input type="range" bind:value {min} {max} {step} {id} class="h-6 w-full" />
  <span class="ml-2 text-sm text-black/50 tabular-nums text-right inline-grid">
    <span class="col-span-full row-span-full invisible">{min}</span>
    <span class="col-span-full row-span-full">{value}</span>
    <span class="col-span-full row-span-full invisible">{max}</span>
  </span>
  <Button
    icon={mdiChevronRight}
    on:click={() => (value += value < max ? step : 0)}
    class="ml-2"
    size="sm"
  />
</Field>
