<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type {
    ChartGroupPointerOptions,
    ChartGroupState as ChartGroupStateType,
  } from '$lib/states/group.svelte.js';

  export type ChartGroupProps = {
    /**
     * Share the hovered data point between charts in the group.  Pass `false` to disable, or
     * options to control how the pointer is matched and rendered.
     *
     * @default true
     */
    pointer?: ChartGroupPointerOptions | boolean;

    /**
     * The group state, exposed for reading (ex. `group.pointer.data`) or for driving the group
     * from outside a chart.
     *
     * @bindable
     */
    state?: ChartGroupStateType;

    children?: Snippet<[{ group: ChartGroupStateType }]>;
  };
</script>

<script lang="ts">
  import { ChartGroupState } from '$lib/states/group.svelte.js';
  import { setChartGroup } from '$lib/contexts/group.js';

  let { pointer, state: stateProp = $bindable(), children }: ChartGroupProps = $props();

  // Constructed once — descendant charts hold a reference for the lifetime of the group.  Option
  // changes are read through `group.options`, so they stay reactive without re-creating it.
  const group = new ChartGroupState({ get pointer() { return pointer; } }); // prettier-ignore

  stateProp = group;
  setChartGroup(group);
</script>

{@render children?.({ group })}
