<script lang="ts" module>
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type ColorRampPropsWithoutHTML = {
    /**
     * The interpolator function to use for the color ramp.
     *
     * @default (t: number) => `hsl(${t * 360}, 100%, 50%)`
     */
    interpolator?: (t: number) => string;

    /**
     * The number of steps in the color ramp.
     *
     * @default 10
     */
    steps?: number;

    /**
     * The height of the color ramp.
     *
     * @default '20px'
     */
    height?: string | number;

    /**
     * The width of the color ramp.
     *
     * @default '100%'
     */
    width?: string | number;

    /**
     * A bindable reference to the underlying `<image>` element.
     *
     * @bindable
     */
    ref?: SVGImageElement;
  };

  export type ColorRampProps = ColorRampPropsWithoutHTML &
    Without<SVGAttributes<SVGImageElement>, ColorRampPropsWithoutHTML>;
</script>

<script lang="ts">
  let {
    interpolator,
    steps = 10,
    height = '20px',
    width = '100%',
    ref: refProp = $bindable(),
    ...restProps
  }: ColorRampProps = $props();

  let ref = $state<SVGImageElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  let href = $state('');

  $effect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = steps;
    canvas.height = 1;
    const context = canvas.getContext('2d')!;
    for (let i = 0; i < steps; ++i) {
      if (interpolator) {
        context.fillStyle = interpolator(i / (steps - 1));
      }
      context.fillRect(i, 0, 1, 1);
    }
    href = canvas.toDataURL();
  });
</script>

<image
  bind:this={ref}
  {href}
  preserveAspectRatio="none"
  {height}
  {width}
  {...extractLayerProps(restProps, 'color-ramp')}
/>
