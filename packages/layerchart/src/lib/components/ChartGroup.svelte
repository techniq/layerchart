<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type {
    ChartGroupBrushOptions,
    ChartGroupDomainOptions,
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
     * Share the brush selection between charts in the group.  Pass `false` to disable.
     *
     * @default true
     */
    brush?: ChartGroupBrushOptions | boolean;

    /**
     * Share the visible domain, so zooming one chart zooms the others.  Pass `false` to disable.
     *
     * @default true
     */
    domain?: ChartGroupDomainOptions | boolean;

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

  let {
    pointer,
    brush,
    domain,
    state: stateProp = $bindable(),
    children,
  }: ChartGroupProps = $props();

  // Constructed once — descendant charts hold a reference for the lifetime of the group.  Options
  // are read through getters so changing them stays reactive without re-creating the group.
  const group = new ChartGroupState({
    get pointer() {
      return pointer;
    },
    get brush() {
      return brush;
    },
    get domain() {
      return domain;
    },
  });

  stateProp = group;
  setChartGroup(group);
</script>

{@render children?.({ group })}
