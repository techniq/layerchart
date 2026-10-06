<script lang="ts">
  /**
   * Renders any simplified chart with `bind:ref` and `bind:context`, reporting what the
   * bindings receive so tests can assert they reach the parent.
   */
  import type { Component } from 'svelte';

  let {
    component,
    onbind,
    ...props
  }: { component: Component<any>; onbind: (bound: { ref: any; context: any }) => void } & Record<
    string,
    any
  > = $props();

  const Chart = $derived(component);

  let ref = $state<HTMLElement>();
  let context = $state<any>();

  $effect(() => {
    onbind({ ref, context });
  });
</script>

<Chart bind:ref bind:context {...props} />
