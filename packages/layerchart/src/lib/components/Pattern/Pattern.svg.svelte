<script lang="ts" module>
  export type {
    PatternProps,
    PatternPropsWithoutHTML,
  } from './Pattern.shared.svelte.js';
</script>

<script lang="ts">
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { createId } from '$lib/utils/createId.js';
  import { buildPatternShapes, type PatternProps } from './Pattern.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('pattern-', uid),
    size = 4,
    width = size,
    height = size,
    lines: linesProp,
    circles: circlesProp,
    background,
    patternContent,
    children,
    ...rest
  }: PatternProps = $props();

  const shapes = $derived(buildPatternShapes(linesProp, circlesProp, size, width, height));
</script>

<defs>
  <pattern
    {id}
    {width}
    {height}
    patternUnits="userSpaceOnUse"
    {...extractLayerProps(rest, 'lc-pattern')}
  >
    {#if patternContent}
      {@render patternContent?.()}
    {:else}
      {#if background}
        <rect {width} {height} fill={background} />
      {/if}

      {#each shapes.filter((s) => s.type === 'line') as line}
        <path
          d={line.path}
          stroke={line.stroke}
          stroke-width={line.strokeWidth}
          fill="none"
          opacity={line.opacity}
        />
      {/each}

      {#each shapes.filter((s) => s.type === 'circle') as circle}
        <circle
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill={circle.fill}
          opacity={circle.opacity}
        />
      {/each}
    {/if}
  </pattern>
</defs>

{@render children?.({ id, pattern: `url(#${id})` })}
