<script lang="ts">
  import type { PatternProps } from 'layerchart';
  import { buildPatternShapes } from 'layerchart/base';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { registerPaint, type PatternPaint } from '../../utils/paint.svelte.js';

  const uid = $props.id();

  let {
    id = `pattern--${uid}`,
    size = 4,
    width = size,
    height = size,
    lines,
    circles,
    rects,
    background,
    children,
  }: PatternProps = $props();

  const scene = getSceneContext();

  const shapes = $derived(buildPatternShapes(lines, circles, size, width, height, rects));

  // The marks inside (or any naming `url(#id)`) fill with its tile, repeating from the plot's
  // origin as SVG's `<pattern patternUnits="userSpaceOnUse">`
  const paint: PatternPaint = {
    type: 'pattern',
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get shapes() {
      return shapes;
    },
    get background() {
      return background;
    },
  };
  registerPaint(scene, () => id, paint);
</script>

<!-- A pattern the scene's marks fill with `url(#id)`, as the core `Pattern`'s SVG one (not its `patternContent`, SVG's own) -->
{@render children?.({ id, pattern: `url(#${id})` })}
