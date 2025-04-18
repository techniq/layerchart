<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';

  import type { Without } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { createId } from '$lib/utils/createId.js';
  import { degreesToRadians } from '$lib/utils/math.js';

  export type PatternPropsWithoutHTML = {
    /**
     * The id of the pattern
     */
    id?: string;

    /**
     * The width of the pattern for custom patterns (set by `lines`, etc)
     */
    width?: number;

    /**
     * The height of the pattern for custom patterns (set by `lines`, etc)
     */
    height?: number;

    /**
     * Render as a child of the pattern
     */
    patternContent?: Snippet;

    /**
     * The number of lines to render
     */
    lines?: {
      spacing: number;
      rotate?: number;
      /** Color of line (defaults to `var(--color-surface-content)`) */
      color?: string;
      background?: string;
      lineWidth?: string;
    }[];

    children?: Snippet<[{ id: string; pattern: string }]>;
  };

  export type PatternProps = PatternPropsWithoutHTML &
    Without<SVGAttributes<SVGPatternElement>, PatternPropsWithoutHTML>;
</script>

<script lang="ts">
  const uid = $props.id();

  let {
    id = createId('pattern-', uid),
    width,
    height,
    patternContent,
    children,
    lines: linesProp,
    ...restProps
  }: PatternProps = $props();

  let lines = $state<{ path: string; stroke: string; strokeWidth: string | number }[]>([]);
  if (linesProp) {
    for (const line of linesProp) {
      const spacing = Math.abs(line.spacing);
      const stroke = line.color ?? 'var(--color-surface-content)';
      const strokeWidth = line.lineWidth ?? 1;

      let rotate = Math.round(line.rotate ?? 0) % 360;
      if (rotate > 180) rotate = rotate - 360;
      else if (rotate > 90) rotate = rotate - 180;
      else if (rotate < -180) rotate = rotate + 360;
      else if (rotate < -90) rotate = rotate + 180;

      width = spacing;
      height = spacing;

      // Use a <path> instead of a <line> to have corners without gaps (start, main line, end)
      let path = '';

      if (rotate === 0) {
        path = `
        M 0 0 L ${width} 0
        M 0 ${height} L ${width} ${height}
    `;
      } else if (rotate === 90) {
        path = `
        M 0 0 L 0 ${height}
        M ${width} 0 L ${width} ${height}
    `;
      } else {
        width = Math.abs(spacing / Math.sin(degreesToRadians(rotate)));
        height = spacing / Math.sin(degreesToRadians(90 - rotate));

        if (rotate > 0) {
          path = `
          M 0 ${-height} L ${width * 2} ${height}
          M ${-width} ${-height} L ${width} ${height}
          M ${-width} 0 L ${width} ${height * 2}
      `;
        } else {
          path = `
          M ${-width} ${height} L ${width} ${-height}
          M ${-width} ${height * 2} L ${width * 2} ${-height}
          M 0 ${height * 2} L ${width * 2} 0
      `;
        }
      }

      lines.push({
        path,
        stroke,
        strokeWidth,
      });
    }
  }
</script>

<defs>
  <pattern
    {id}
    {width}
    {height}
    patternUnits="userSpaceOnUse"
    {...extractLayerProps(restProps, 'pattern')}
  >
    {#if patternContent}
      {@render patternContent?.()}
    {:else if linesProp}
      {#each lines as line}
        <path d={line.path} fill="none" stroke={line.stroke} stroke-width={line.strokeWidth} />
      {/each}
    {/if}
  </pattern>
</defs>

{@render children?.({ id, pattern: `url(#${id})` })}
