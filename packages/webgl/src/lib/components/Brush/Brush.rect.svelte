<script lang="ts">
  import Rect from '../Rect/Rect.svelte';
  import { getBrushParts, type BrushPart } from './Brush.parts.js';

  // A part of the brush: drawn as a `Rect`, and its drag handlers kept for `Brush` to call, as a
  // scene's shapes aren't elements to take them
  let {
    ref = $bindable(),
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    class: className,
    onpointerdown,
    ondblclick,
    'data-position': position,
  }: {
    ref?: unknown;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    class?: string;
    onpointerdown?: BrushPart['onpointerdown'];
    ondblclick?: BrushPart['ondblclick'];
    'data-position'?: string;
  } = $props();

  const parts = getBrushParts();
  const part: BrushPart = {
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get class() {
      return className;
    },
    get position() {
      return position;
    },
    get onpointerdown() {
      return onpointerdown;
    },
    get ondblclick() {
      return ondblclick;
    },
  };
  parts?.push(part);
  $effect(() => () => {
    if (parts?.includes(part)) parts.splice(parts.indexOf(part), 1);
  });
</script>

<Rect {x} {y} {width} {height} class={className} />
