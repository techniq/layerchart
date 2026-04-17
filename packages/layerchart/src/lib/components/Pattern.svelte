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
     * Render as a child of the pattern.
     *
     * Note: only supported on the `<Svg>` layer.
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
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createPattern } from '$lib/utils/canvas.js';

  const chartCtx = getChartContext();

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

  const layerCtx = getLayerContext();

  let canvasPattern = $state<CanvasPattern | null>(null);

  let shapes = $state<PatternShape[]>([]);

  if (linesProp) {
    const lineDefs = Array.isArray(linesProp) ? linesProp : linesProp === true ? [{}] : [linesProp];
    for (const line of lineDefs) {
      // const spacing = Math.abs(line.spacing);
      const stroke = line.color ?? 'var(--color-surface-content, currentColor)';
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
            fill: circle.color ?? 'var(--color-surface-content, currentColor)',
            opacity: circle.opacity ?? 1,
          },
          {
            type: 'circle',
            cx: (size * 3) / 4,
            cy: (size * 3) / 4,
            r: circle.radius ?? 1,
            fill: circle.color ?? 'var(--color-surface-content, currentColor)',
            opacity: circle.opacity ?? 1,
          }
        );
      } else {
        shapes.push({
          type: 'circle',
          cx: size / 2,
          cy: size / 2,
          r: circle.radius ?? 1,
          fill: circle.color ?? 'var(--color-surface-content, currentColor)',
          opacity: circle.opacity ?? 1,
        });
      }
    }
  }

  function render(_ctx: CanvasRenderingContext2D) {
    const pattern = createPattern(_ctx, width, height, shapes, background);
    canvasPattern = pattern;
  }

  if (layerCtx === 'canvas') {
    chartCtx.registerComponent({ name: 'Pattern', kind: 'group', canvasRender: {
      render,
      deps: () => [width, height, shapes, background],
    } });
  }

  function withOpacity(color: string, opacity: number) {
    return opacity === 1
      ? color
      : `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
  }

  // Build a CSS `background` value from lines/circles/background.
  // Uses repeating-linear-gradient for lines and radial-gradient for circles
  // so CSS variables/classes resolve natively in the HTML layer.
  function createCSSPattern(): string {
    const layers: string[] = [];

    if (linesProp) {
      const lineDefs = Array.isArray(linesProp)
        ? linesProp
        : linesProp === true
          ? [{}]
          : [linesProp];
      for (const line of lineDefs) {
        const color = withOpacity(
          line.color ?? 'var(--color-surface-content, currentColor)',
          line.opacity ?? 1
        );
        const sw = line.width ?? 1;

        let rotate = Math.round(line.rotate ?? 0) % 360;
        if (rotate > 180) rotate = rotate - 360;
        else if (rotate > 90) rotate = rotate - 180;
        else if (rotate < -180) rotate = rotate + 360;
        else if (rotate < -90) rotate = rotate + 180;

        let angle: number;
        let period: number;
        if (rotate === 0) {
          angle = 0;
          period = height;
        } else if (rotate === 90) {
          angle = 90;
          period = width;
        } else if (rotate > 0) {
          angle = 45;
          period = (width * height) / Math.sqrt(width * width + height * height);
        } else {
          angle = 135;
          period = (width * height) / Math.sqrt(width * width + height * height);
        }

        layers.push(
          `repeating-linear-gradient(${angle}deg, ${color} 0 ${sw}px, transparent ${sw}px ${period}px)`
        );
      }
    }

    if (circlesProp) {
      const circleDefs = Array.isArray(circlesProp)
        ? circlesProp
        : circlesProp === true
          ? [{}]
          : [circlesProp];
      for (const circle of circleDefs) {
        const color = withOpacity(
          circle.color ?? 'var(--color-surface-content, currentColor)',
          circle.opacity ?? 1
        );
        const r = circle.radius ?? 1;

        if (circle.stagger) {
          layers.push(
            `radial-gradient(circle at 25% 25%, ${color} ${r}px, transparent ${r}px) 0 0 / ${size}px ${size}px`,
            `radial-gradient(circle at 75% 75%, ${color} ${r}px, transparent ${r}px) 0 0 / ${size}px ${size}px`
          );
        } else {
          layers.push(
            `radial-gradient(circle at center, ${color} ${r}px, transparent ${r}px) 0 0 / ${size}px ${size}px`
          );
        }
      }
    }

    // `background` may be either a plain color or an image value (e.g. `linear-gradient(...)`
    // when used as `<Pattern background={gradient}>`). Images go in the image-layer list
    // tiled at the pattern size (after shape layers so they paint underneath);
    // colors go in the background-color slot.
    const isImage = background != null && /gradient\(|url\(/i.test(background);
    if (isImage) layers.push(`${background} 0 0 / ${width}px ${height}px`);

    if (layers.length === 0) return background ?? 'transparent';
    return !isImage && background ? `${layers.join(', ')}, ${background}` : layers.join(', ');
  }
</script>

{#if layerCtx === 'canvas'}
  {@render children?.({ id, pattern: asAny(canvasPattern) })}
{:else if layerCtx === 'svg'}
  <defs>
    <pattern
      {id}
      {width}
      {height}
      patternUnits="userSpaceOnUse"
      {...extractLayerProps(restProps, 'lc-pattern')}
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
{:else if layerCtx === 'html'}
  {@render children?.({ id, pattern: createCSSPattern() })}
{/if}
