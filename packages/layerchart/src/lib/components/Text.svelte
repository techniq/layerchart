<script lang="ts" module>
  import type { CommonStyleProps, Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { motionState, type MotionProps } from '$lib/stores/motionState.svelte.js';

  export type TextPropsWithoutHTML = {
    /**
     * text value
     * @default 0
     */
    value?: string | number;

    /**
     * Maximum width to occupy (approximate as words are not split)
     */
    width?: number;

    /**
     * x position of the text
     *
     * @default 0
     */
    x?: string | number;

    /**
     * Initial x position of the text
     *
     * @default x
     */
    initialX?: string | number;

    /**
     * y position of the text
     *
     * @default 0
     */
    y?: string | number;

    /**
     * Initial y position of the text
     *
     * @default y
     */
    initialY?: string | number;

    /**
     * dx offset of the text
     *
     * @default 0
     */
    dx?: string | number;

    /**
     * dy offset of the text
     *
     * @default 0
     */
    dy?: string | number;

    /**
     * Desired "line height" of the text, implemented as y offsets
     *
     * @default "1em"
     */
    lineHeight?: string;

    /**
     * Cap height of the text
     * @default '0.71em'
     */
    capHeight?: string;

    /**
     * Whether to scale the fontSize to accommodate the specified width
     *
     * @default false
     */

    scaleToFit?: boolean;

    /**
     * Horizontal text anchor
     *
     * @default 'start'
     */
    textAnchor?: 'start' | 'middle' | 'end' | 'inherit';

    /**
     * Vertical text anchor
     *
     * @default 'end'
     */
    verticalAnchor?: 'start' | 'middle' | 'end' | 'inherit';

    /**
     * Rotational angle of the text
     */
    rotate?: number;

    /**
     * A bindable reference to the wrapping `<svg>` element.
     *
     * @bindable
     */
    svgRef?: SVGElement;

    /**
     * Props to pass to the wrapping `<svg>` element.
     */
    svgProps?: Omit<SVGAttributes<SVGElement>, 'children'>;

    /**
     * A bindable reference to the inner `<text>` element
     *
     * @bindable
     */
    ref?: SVGTextElement;
  } & MotionProps &
    CommonStyleProps;

  export type TextProps = TextPropsWithoutHTML &
    Without<SVGAttributes<SVGTextElement>, TextPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getStringWidth } from '$lib/utils/string.js';
  import { renderText, type ComputedStylesOptions } from '../utils/canvas.js';
  import { afterTick } from 'layerchart/utils/afterTick.js';

  import { createKey } from 'layerchart/utils/key.svelte.js';

  /*
    TODO:
      - [ ] Handle styled text (use <slot /> to measure?)
			- [ ] Simplify by using `alignment-baseline` / `dominant-baseline`, rework multiline or drop support, etc
			  - https://svelte.dev/repl/f12d3003313a43ba8a0be53e5786f1c7?version=3.44.3
				- https://observablehq.com/@neocartocnrs/cheat-sheet-on-texts-in-svg

    Reference:
    - https://bl.ocks.org/mbostock/7555321
    - https://github.com/airbnb/visx/blob/master/packages/visx-text/src/Text.tsx
      - https://airbnb.io/visx/text
      - https://github.com/airbnb/visx/blob/master/packages/visx-demo/src/pages/text.tsx
  */

  let {
    value,
    x = 0,
    initialX = x,
    y = 0,
    initialY = y,
    dx = 0,
    dy = 0,
    lineHeight = '1em',
    capHeight = '0.71em',
    width,
    scaleToFit = false,
    textAnchor = 'start',
    verticalAnchor = 'end',
    rotate,
    opacity = 1,
    strokeWidth = 0,
    stroke,
    fill,
    fillOpacity,
    spring,
    tweened,
    svgRef = $bindable(),
    ref = $bindable(),
    class: className,
    svgProps = {},
    ...restProps
  }: TextProps = $props();

  let style: CSSStyleDeclaration | undefined = undefined; // TODO: read from DOM?

  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  const words = $derived(value != null ? value.toString().split(/(?:(?!\u00A0+)\s+)/) : []);

  const wordsWithWidth = $derived(
    words.map((word) => ({
      word,
      width: getStringWidth(word, style) || 0,
    }))
  );

  const spaceWidth = $derived(getStringWidth('\u00A0', style) || 0);

  const wordsByLines = $derived(
    wordsWithWidth.reduce((result: { words: string[]; width?: number }[], item) => {
      const currentLine = result[result.length - 1];

      if (
        currentLine &&
        (width == null || scaleToFit || (currentLine.width || 0) + item.width + spaceWidth < width)
      ) {
        // Word can be added to an existing line
        currentLine.words.push(item.word);
        currentLine.width = currentLine.width || 0;
        currentLine.width += item.width + spaceWidth;
      } else {
        // Add first word to line or word is too long to scaleToFit on existing line
        const newLine = { words: [item.word], width: item.width };
        result.push(newLine);
      }

      return result;
    }, [])
  );

  const lines = $derived(wordsByLines.length);

  /**
   * Convert css value to pixel value (ex. 0.71em => 11.36)
   */
  function getPixelValue(cssValue: number | string) {
    // TODO: Properly measure pixel values using DOM (handle inherited font size, zoom, etc)

    if (typeof cssValue === 'number') return cssValue;

    const result = cssValue.match(/([\d.]+)(\D+)/);
    const number = Number(result?.[1]);
    switch (result?.[2]) {
      case 'px':
        return number;
      case 'em':
      case 'rem':
        return number * 16;
      default:
        return 0;
    }
  }

  const startDy = $derived.by(() => {
    if (verticalAnchor === 'start') {
      return getPixelValue(capHeight);
    } else if (verticalAnchor === 'middle') {
      return ((lines - 1) / 2) * -getPixelValue(lineHeight) + getPixelValue(capHeight) / 2;
    } else {
      return (lines - 1) * -getPixelValue(lineHeight);
    }
  });

  const scaleTransform = $derived.by(() => {
    if (
      scaleToFit &&
      lines > 0 &&
      typeof x == 'number' &&
      typeof y == 'number' &&
      typeof width == 'number'
    ) {
      const lineWidth = wordsByLines[0].width || 1;
      const sx = width / lineWidth;
      const sy = sx;
      const originX = x - sx * x;
      const originY = y - sy * y;
      return `matrix(${sx}, 0, 0, ${sy}, ${originX}, ${originY})`;
    } else {
      return '';
    }
  });

  const rotateTransform = $derived(rotate ? `rotate(${rotate}, ${x}, ${y})` : '');
  const transform = $derived(`${scaleTransform} ${rotateTransform}`);

  function isValidXOrY(xOrY: string | number | undefined) {
    return (
      // number that is not NaN or Infinity
      (typeof xOrY === 'number' && Number.isFinite(xOrY)) ||
      // for percentage
      typeof xOrY === 'string'
    );
  }

  const tweenedX = motionState(initialX, { spring, tweened });
  const tweenedY = motionState(initialY, { spring, tweened });

  $effect(() => {
    [x, y];
    afterTick(() => {
      tweenedX.target = x;
      tweenedY.target = y;
    });
  });

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    wordsByLines.forEach((line, index) => {
      renderText(
        ctx,
        line.words.join(' '),
        {
          x: getPixelValue(tweenedX.current) + getPixelValue(dx),
          y:
            getPixelValue(tweenedY.current) +
            getPixelValue(dy) +
            (index === 0 ? startDy : getPixelValue(lineHeight)),
        },
        styleOverrides
          ? merge({ styles: { strokeWidth } }, styleOverrides)
          : {
              styles: {
                fill,
                fillOpacity,
                stroke,
                strokeWidth,
                opacity,
                paintOrder: 'stroke',
                textAnchor,
              },
              classes: cls(fill === undefined && 'fill-surface-content', className),
            }
      );
    });
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    [
      value,
      tweenedX.current,
      tweenedY.current,
      fillKey.current,
      strokeKey.current,
      strokeWidth,
      opacity,
      className,
    ];
    canvasCtx.invalidate();
  });

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    return canvasCtx.register({ name: 'Text', render });
  });
</script>

{#if renderCtx === 'svg'}
  <!-- `overflow: visible` allow contents to be shown outside element -->
  <!-- `paint-order: stroke` supports stroke outlining text  -->
  <svg
    x={dx}
    y={dy}
    {...svgProps}
    class={cls('overflow-visible [paint-order:stroke]', svgProps?.class)}
    bind:this={svgRef}
  >
    {#if isValidXOrY(x) && isValidXOrY(y)}
      <text
        x={tweenedX.current}
        y={tweenedY.current}
        {transform}
        text-anchor={textAnchor}
        {...restProps}
        {fill}
        fill-opacity={fillOpacity}
        {stroke}
        stroke-width={strokeWidth}
        {opacity}
        class={cls(fill === undefined && 'fill-surface-content', className)}
      >
        {#each wordsByLines as line, index}
          <tspan x={tweenedX.current} dy={index === 0 ? startDy : lineHeight}>
            {line.words.join(' ')}
          </tspan>
        {/each}
      </text>
    {/if}
  </svg>
{/if}
