<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import { cls } from '@layerstack/tailwind';

  import { getStringWidth } from '$lib/utils/string.js';
  import { motionStore } from '$lib/stores/motionStore.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderText } from '../utils/canvas.js';

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

  /** text value */
  export let value: string | number = 0;

  /** Maximum width to occupy (approximate as words are not split) */
  export let width: number | undefined = undefined;

  /** x position of the text */
  export let x: string | number = 0;
  export let initialX = x;

  /** y position of the text */
  export let y: string | number = 0;
  export let initialY = y;

  /** dx offset of the text */
  export let dx: string | number = 0;

  /** dy offset of the text */
  export let dy: string | number = 0;

  /** Desired "line height" of the text, implemented as y offsets */
  export let lineHeight = '1em';

  /** Cap height of the text */
  export let capHeight = '0.71em'; // Magic number from d3

  /** Whether to scale the fontSize to accommodate the specified width  */
  export let scaleToFit: boolean = false;

  /** Horizontal text anchor */
  export let textAnchor: 'start' | 'middle' | 'end' | 'inherit' = 'start';

  /** Vertical text anchor */
  export let verticalAnchor: 'start' | 'middle' | 'end' | 'inherit' = 'end'; // default SVG behavior

  /** Rotational angle of the text */
  export let rotate: number | undefined = undefined;

  export let fill: string | undefined = undefined;
  export let fillOpacity: number | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | undefined = undefined;

  let wordsByLines: { words: string[]; width?: number }[] = [];
  let wordsWithWidth: { word: string; width: number }[] = [];
  let spaceWidth: number = 0;

  let style: CSSStyleDeclaration | undefined = undefined; // TODO: read from DOM?

  $: words = value != null ? value.toString().split(/(?:(?!\u00A0+)\s+)/) : [];

  $: wordsWithWidth = words.map((word) => ({
    word,
    width: getStringWidth(word, style) || 0,
  }));

  $: spaceWidth = getStringWidth('\u00A0', style) || 0;

  $: wordsByLines = wordsWithWidth.reduce((result: typeof wordsByLines, item) => {
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
  }, []);
  $: lines = wordsByLines.length;

  /**
   * Convert css value to pixel value (ex. 0.71em => 11.36)
   */
  function getPixelValue(cssValue: number | string) {
    // TODO: Properly measure pixel values using DOM (handle inherited font size, zoom, etc)

    if (typeof cssValue === 'number') {
      return cssValue;
    }

    // @ts-expect-error
    const [match, value, units] = cssValue.match(/([\d.]+)(\D+)/);
    const number = Number(value);
    switch (units) {
      case 'px':
        return number;
      case 'em':
      case 'rem':
        return number * 16;
      default:
        return 0;
    }
  }

  let startDy = 0;
  $: if (verticalAnchor === 'start') {
    startDy = getPixelValue(capHeight);
  } else if (verticalAnchor === 'middle') {
    startDy = ((lines - 1) / 2) * -getPixelValue(lineHeight) + getPixelValue(capHeight) / 2;
  } else {
    startDy = (lines - 1) * -getPixelValue(lineHeight);
  }

  let scaleTransform = '';
  $: if (
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
    scaleTransform = `matrix(${sx}, 0, 0, ${sy}, ${originX}, ${originY})`;
  } else {
    scaleTransform = '';
  }
  $: rotateTransform = rotate ? `rotate(${rotate}, ${x}, ${y})` : '';

  $: transform = `${scaleTransform} ${rotateTransform}`;

  function isValidXOrY(xOrY: string | number | undefined) {
    return (
      // number that is not NaN or Infinity
      (typeof xOrY === 'number' && Number.isFinite(xOrY)) ||
      // for percentage
      typeof xOrY === 'string'
    );
  }

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  let tweened_x = motionStore(initialX, { spring, tweened });
  let tweened_y = motionStore(initialY, { spring, tweened });

  $: tick().then(() => {
    tweened_x.set(x);
    tweened_y.set(y);
  });

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';

  function render(ctx: CanvasRenderingContext2D) {
    wordsByLines.forEach((line, index) => {
      renderText(
        ctx,
        line.words.join(' '),
        {
          x: getPixelValue($tweened_x) + getPixelValue(dx),
          y:
            getPixelValue($tweened_y) +
            getPixelValue(dy) +
            (index === 0 ? startDy : getPixelValue(lineHeight)),
        },
        {
          styles: { fill, fillOpacity, stroke, strokeWidth, paintOrder: 'stroke', textAnchor },
          classes: cls(fill === undefined && 'fill-surface-content', $$props.class),
        }
      );
    });
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({ name: 'Text', render });
  }

  $: if (renderContext === 'canvas') {
    // Redraw when props changes (TODO: styles, class, etc)
    value && $tweened_x && $tweened_y;
    canvasContext.invalidate();
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
</script>

{#if renderContext === 'svg'}
  <!-- `overflow: visible` allow contents to be shown outside element -->
  <!-- `paint-order: stroke` supports stroke outlining text  -->
  <svg x={dx} y={dy} class="overflow-visible [paint-order:stroke]">
    {#if isValidXOrY(x) && isValidXOrY(y)}
      <text
        x={$tweened_x}
        y={$tweened_y}
        {transform}
        text-anchor={textAnchor}
        {...$$restProps}
        {fill}
        fill-opacity={fillOpacity}
        {stroke}
        stroke-width={strokeWidth}
        class={cls(fill === undefined && 'fill-surface-content', $$props.class)}
      >
        {#each wordsByLines as line, index}
          <tspan x={$tweened_x} dy={index === 0 ? startDy : lineHeight}>
            {line.words.join(' ')}
          </tspan>
        {/each}
      </text>
    {/if}
  </svg>
{/if}
