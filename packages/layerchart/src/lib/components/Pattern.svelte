<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';

  import type { Without } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { createId } from '$lib/utils/createId.js';

  export type PatternPropsWithoutHTML = {
    /**
     * The id of the pattern
     */
    id?: string;

    /**
     * The width of the pattern
     */
    width: number;

    /**
     * The height of the pattern
     */
    height: number;

    /**
     * Render as a child of the pattern
     */
    patternContent: Snippet;

    children?: Snippet<[{ id: string; pattern: string }]>;
  };

  export type PatternProps = PatternPropsWithoutHTML &
    Without<SVGAttributes<SVGPatternElement>, PatternPropsWithoutHTML>;
</script>

<script lang="ts">
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern
  // https://airbnb.io/visx/patterns
  // https://github.com/airbnb/visx/tree/master/packages/visx-pattern/src/patterns

  const uid = $props.id();

  let {
    id = createId('pattern-', uid),
    width,
    height,
    patternContent,
    children,
    ...restProps
  }: PatternProps = $props();
</script>

<defs>
  <pattern
    {id}
    {width}
    {height}
    patternUnits="userSpaceOnUse"
    {...extractLayerProps(restProps, 'pattern')}
  >
    {@render patternContent?.()}
  </pattern>
</defs>

{@render children?.({ id, pattern: `url(#${id})` })}
