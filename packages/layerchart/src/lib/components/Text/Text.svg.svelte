<script lang="ts" module>
  export type {
    TextProps,
    TextPropsWithoutHTML,
    TextSegment,
  } from './Text.shared.svelte.js';
</script>

<script lang="ts">
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { createId } from '$lib/utils/createId.js';
  import {
    TextState,
    textMarkInfo,
    getPixelValue,
    type TextProps,
  } from './Text.shared.svelte.js';

  const uid = $props.id();

  let {
    svgRef: svgRefProp = $bindable(),
    ref: refProp = $bindable(),
    pathId = createId('text-path', uid),
    // Pull out props that collide with SVG `<text>`/`<svg>` attribute names
    // — we use these internally for layout and transforms, not as raw DOM
    // attrs. Without this, `{...rest}` spread would set
    // `<text rotate="..." dx="..." dy="...">` (which SVG interprets per
    // glyph, not on the whole text).
    rotate,
    dx,
    dy,
    // `fontSize` is a typed prop (drives `capHeight` defaults), but on the
    // DOM it must be rendered as the kebab-case `font-size` attribute.
    fontSize,
    ...rest
  }: TextProps = $props();

  const c = new TextState(() => ({ rotate, dx, dy, fontSize, ...rest } as TextProps));

  let ref = $state<SVGTextElement>();
  let svgRef = $state<SVGElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  $effect.pre(() => {
    svgRefProp = svgRef;
  });

  c.chartCtx.registerComponent({
    name: 'Text',
    kind: 'mark',
    markInfo: () => textMarkInfo(rest as TextProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    {@const text = c.resolveTextValue(item.d)}
    {@const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(rest.class, item.d)}
    {@const dataRotateTransform = rotate
      ? `rotate(${rotate}, ${item.x}, ${item.y})`
      : ''}
    <svg
      x={dx ?? 0}
      y={dy ?? 0}
      {...rest.svgProps}
      class={['lc-text-svg', rest.svgProps?.class]}
    >
      <text
        {...rest as any}
        x={item.x}
        y={item.y}
        transform={(rest.transform as string | undefined) ?? dataRotateTransform}
        text-anchor={rest.textAnchor ?? 'start'}
        dominant-baseline={rest.dominantBaseline ?? 'auto'}
        font-size={fontSize}
        fill={resolvedFill}
        fill-opacity={resolvedFillOpacity}
        stroke={resolvedStroke}
        stroke-width={resolvedStrokeWidth}
        opacity={resolvedOpacity}
        class={['lc-text', resolvedClass]}
      >
        <tspan x={item.x} dy={c.dataModeStartDy} class="lc-text-tspan">
          {text}
        </tspan>
      </text>
    </svg>
  {/each}
{:else}
  <svg
    x={dx ?? 0}
    y={dy ?? 0}
    {...rest.svgProps}
    class={['lc-text-svg', rest.svgProps?.class]}
    bind:this={svgRef}
  >
    {#if rest.path}
      <defs>
        {#key rest.path}
          <path bind:this={c.pathRef} id={pathId} d={rest.path} />
        {/key}
      </defs>
      <text
        {...rest as any}
        bind:this={ref}
        dy={dy ?? 0}
        font-size={fontSize}
        fill={c.staticFill}
        fill-opacity={c.staticFillOpacity}
        stroke={c.staticStroke}
        stroke-width={c.staticStrokeWidth}
        opacity={c.staticOpacity}
        transform={rest.transform as string | undefined}
        class={['lc-text', c.staticClassName]}
      >
        <textPath
          style="text-anchor: {rest.textAnchor ?? 'start'};"
          dominant-baseline={rest.dominantBaseline ?? 'auto'}
          href="#{pathId}"
          startOffset={rest.startOffset ?? '0%'}
          class="lc-text-path"
        >
          {c.wordsByLines.map((line) => line.words.join(' ')).join()}
        </textPath>
      </text>
    {:else}
      <!-- `motionX` / `motionY` default to 0 when `x` / `y` aren't set, matching
           SVG's natural "missing coord = 0" behavior. This lets `<Text>` work
           inside positioned parents like `<Group>` or `<Arc>` even without
           explicit coordinates (matching `Text.canvas` / `Text.html`). -->
      <text
        {...rest as any}
        bind:this={ref}
        x={c.motionX}
        y={c.motionY}
        transform={c.transform}
        text-anchor={rest.textAnchor ?? 'start'}
        dominant-baseline={rest.dominantBaseline ?? 'auto'}
        font-size={fontSize}
        fill={c.staticFill}
        fill-opacity={c.staticFillOpacity}
        stroke={c.staticStroke}
        stroke-width={c.staticStrokeWidth}
        opacity={c.staticOpacity}
        class={['lc-text', c.staticClassName]}
      >
        {#if rest.segments}
          {#each rest.segments as segment, index (index)}
            <tspan dy={index === 0 ? c.startDy : 0} class={['lc-text-tspan', segment.class]}>
              {segment.value}
            </tspan>
          {/each}
        {:else}
          {#each c.wordsByLines as line, index (index)}
            <tspan
              x={c.motionX}
              dy={index === 0 ? c.startDy : getPixelValue(rest.lineHeight ?? '1em')}
              class="lc-text-tspan"
            >
              {line.words.join(' ')}
            </tspan>
          {/each}
        {/if}
      </text>
    {/if}
  </svg>
{/if}

<style>
  @layer base {
    :global(:where(.lc-text)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    :global(:where(.lc-text-svg)) {
      overflow: visible;
      paint-order: stroke;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-text, svg.lc-text):not([fill])) {
      color: var(--fill-color);
      fill: currentColor;
    }
    :global(:where(.lc-layout-svg .lc-text, svg.lc-text):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
