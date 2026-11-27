<script lang="ts">
  import { getChartContext, type BrushProps } from 'layerchart';
  import { BrushBase } from 'layerchart/base';
  import BrushRect from './Brush.rect.svelte';
  import { cursorOf, setBrushParts, type BrushPart } from './Brush.parts.js';

  let { state: stateProp = $bindable(), ...props }: BrushProps = $props();

  const ctx = getChartContext();

  /** Its parts, drawn in order (the region, then the selection and its handles over it) */
  const parts: BrushPart[] = [];
  setBrushParts(parts);

  /** The topmost part under the pointer, as the core `Brush`'s elements take it */
  function partAt(e: MouseEvent) {
    const container = ctx.containerRef;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const px = e.clientX - rect.left - (ctx.padding.left ?? 0);
    const py = e.clientY - rect.top - (ctx.padding.top ?? 0);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (px >= p.x && px <= p.x + p.width && py >= p.y && py <= p.y + p.height) return p;
    }
    return null;
  }

  // A scene's shapes aren't elements to take the pointer, so the chart's container takes it for
  // them (before the scene can, so a drag brushes rather than turning the view)
  $effect(() => {
    const container = ctx.containerRef;
    if (!container) return;
    const onpointerdown = (e: PointerEvent) => {
      const part = partAt(e);
      // Measured from the container (the plot starts its padding inside it), as from a canvas
      if (part?.onpointerdown) part.onpointerdown(e, container);
    };
    const ondblclick = (e: MouseEvent) => partAt(e)?.ondblclick?.(e);
    let cursor: string | null = null;
    const onpointermove = (e: PointerEvent) => {
      if (e.buttons) return;
      const part = partAt(e);
      const next = part ? cursorOf(part) : null;
      if (next === cursor) return;
      cursor = next;
      container.style.cursor = next ?? '';
    };
    container.addEventListener('pointerdown', onpointerdown, { capture: true });
    container.addEventListener('dblclick', ondblclick, { capture: true });
    container.addEventListener('pointermove', onpointermove);
    return () => {
      container.removeEventListener('pointerdown', onpointerdown, { capture: true });
      container.removeEventListener('dblclick', ondblclick, { capture: true });
      container.removeEventListener('pointermove', onpointermove);
      if (cursor) container.style.cursor = '';
    };
  });
</script>

<!-- LayerChart's `Brush`, its region, selection, and handles drawn with the `Rect` here -->
<BrushBase Rect={BrushRect} bind:state={stateProp} {...props} />
