<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';

  import { asAny, type Without } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { createId } from '$lib/utils/createId.js';

  type PatternLineDef = {
    /**
     * The width of the line
     * @default 1
     */
    width?: string;

    /**
     * The rotation of the line
     * @default 0
     */
    rotate?: number;

    /**
     * The color of the line
     * @default 'var(--color-surface-content)'
     */
    color?: string;

    /**
     * The opacity of the line
     * @default 1
     */
    opacity?: number;
  };

  type PatternCircleDef = {
    /**
     * The radius of the circle
     * @default 1
     */
    radius?: number;

    /**
     * Stagger the circle layout
     * @default false
     */
    stagger?: boolean;

    /**
     * The color of the circle
     * @default 'var(--color-surface-content)'
     */
    color?: string;

    /**
     * The opacity of the circle
     * @default 1
     */
    opacity?: number;
  };

  export type PatternPropsWithoutHTML = {
    /**
     * The id of the pattern
     */
    id?: string;

    /**
     * The size of the pattern (sets `width` and `height` as same value).
     */
    size?: number;

    /**
     * The width of the pattern for custom patterns (set by `lines`, etc)
     */
    width?: number;

    /**
     * The height of the pattern for custom patterns (set by `lines`, etc)
     */
    height?: number;

    /**
     * The number of lines to render
     */
    lines?: boolean | PatternLineDef | PatternLineDef[];

    /**
     * The number of circles to render
     */
    circles?: boolean | PatternCircleDef | PatternCircleDef[];

    /**
     * The background color of the pattern
     */
    background?: string;

    /**
     * Render as a child of the pattern
     */
    patternContent?: Snippet;

    children?: Snippet<[{ id: string; pattern: string }]>;
  };

  export type PatternProps = PatternPropsWithoutHTML &
    Without<SVGAttributes<SVGPatternElement>, PatternPropsWithoutHTML>;

  export type CircleShape = {
    type: 'circle';
    cx: number;
    cy: number;
    r: number;
    fill: string;
    opacity: number;
  };
  export type LineShape = {
    type: 'line';
    path: string;
    stroke: string;
    strokeWidth: string | number;
    opacity: number;
  };

  export type PatternShape = CircleShape | LineShape;
</script>

<script lang="ts">
  import { getRenderContext } from './Chart.svelte';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { createPattern } from '$lib/utils/canvas.js';

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
    ...restProps
  }: PatternProps = $props();

  const renderCtx = getRenderContext();

  let canvasPattern = $state<CanvasPattern | null>(null);

  let shapes = $state<PatternShape[]>([]);

  if (linesProp) {
    const lineDefs = Array.isArray(linesProp) ? linesProp : linesProp === true ? [{}] : [linesProp];
    for (const line of lineDefs) {
      // const spacing = Math.abs(line.spacing);
      const stroke = line.color ?? 'var(--color-surface-content)';
      const strokeWidth = line.width ?? 1;
      const opacity = line.opacity ?? 1;

      let rotate = Math.round(line.rotate ?? 0) % 360;
      if (rotate > 180) rotate = rotate - 360;
      else if (rotate > 90) rotate = rotate - 180;
      else if (rotate < -180) rotate = rotate + 360;
      else if (rotate < -90) rotate = rotate + 180;

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

      shapes.push({
        type: 'line',
        path,
        stroke,
        strokeWidth,
        opacity,
      });
    }
  }

  if (circlesProp) {
    const circleDefs = Array.isArray(circlesProp)
      ? circlesProp
      : circlesProp === true
        ? [{}]
        : [circlesProp];
    for (const circle of circleDefs) {
      if (circle.stagger) {
        shapes.push(
          {
            type: 'circle',
            cx: size / 4,
            cy: size / 4,
            r: circle.radius ?? 1,
            fill: circle.color ?? 'var(--color-surface-content)',
            opacity: circle.opacity ?? 1,
          },
          {
            type: 'circle',
            cx: (size * 3) / 4,
            cy: (size * 3) / 4,
            r: circle.radius ?? 1,
            fill: circle.color ?? 'var(--color-surface-content)',
            opacity: circle.opacity ?? 1,
          }
        );
      } else {
        shapes.push({
          type: 'circle',
          cx: size / 2,
          cy: size / 2,
          r: circle.radius ?? 1,
          fill: circle.color ?? 'var(--color-surface-content)',
          opacity: circle.opacity ?? 1,
        });
      }
    }
  }

  function render(_ctx: CanvasRenderingContext2D) {
    const pattern = createPattern(_ctx, width, height, shapes, background);
    canvasPattern = pattern;
  }

  if (renderCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Pattern',
      render,
      deps: () => [width, height, shapes, background],
    });
  }
</script>

{#if renderCtx === 'canvas'}
  {@render children?.({ id, pattern: asAny(canvasPattern) })}
{:else if renderCtx === 'svg'}
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
      {:else}
        {#if background}
          <rect {width} {height} fill={background} />
        {/if}

        {#each shapes.filter((shape) => shape.type === 'line') as line}
          <path
            d={line.path}
            stroke={line.stroke}
            stroke-width={line.strokeWidth}
            fill="none"
            opacity={line.opacity}
          />
        {/each}

        {#each shapes.filter((shape) => shape.type === 'circle') as circle}
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
{/if}
