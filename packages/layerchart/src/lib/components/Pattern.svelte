<script lang="ts" module>
  import type { Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type PatternPropsWithoutHTML = {
    /**
     * The id of the pattern
     */
    id: string;

    /**
     * The width of the pattern
     */
    width: number;

    /**
     * The height of the pattern
     */
    height: number;
  };

  export type PatternProps = PatternPropsWithoutHTML &
    Without<SVGAttributes<SVGPatternElement>, PatternPropsWithoutHTML>;
</script>

<script lang="ts">
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern
  // https://airbnb.io/visx/patterns
  // https://github.com/airbnb/visx/tree/master/packages/visx-pattern/src/patterns

  let { id, width, height, children, ...restProps }: PatternProps = $props();
</script>

<defs>
  <pattern {id} {width} {height} patternUnits="userSpaceOnUse" {...restProps}>
    {@render children?.()}
  </pattern>
</defs>
