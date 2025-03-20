<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type MotionPathPropsWithoutHTML = {
    /**
     * Id of path to move object along
     */
    pathId?: string;

    /**
     * Id of object to move along path
     */
    objectId?: string;

    /**
     * Duration of the animation
     */
    duration: string;

    /**
     * Number of times the animation will occur
     */
    repeatCount?: number | 'indefinite';

    /**
     * Final state of the animation.  Freeze (last frame) or remove (first frame)
     * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill#animate
     *
     * @default 'freeze'
     */
    fill?: 'freeze' | 'remove';

    /**
     * Rotation applied to the element animated along a path, usually to make it pointing
     * in the direction of the animation
     */
    rotate?: number | 'auto' | 'auto-reverse';

    /**
     * A bindable reference to the underlying `<animateMotion>` element.
     *
     * @bindable
     */
    ref?: SVGAnimateMotionElement;

    children?: Snippet<[{ pathId: string; objectId: string }]>;
  };

  export type MotionPathProps = MotionPathPropsWithoutHTML &
    Without<
      Omit<SVGAttributes<SVGAnimateMotionElement>, 'dir' | 'href'>,
      MotionPathPropsWithoutHTML
    >;
</script>

<script lang="ts">
  import type { Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { createId } from 'layerchart/utils/createId.js';
  import { createDataAttr } from 'layerchart/utils/attributes.js';

  const uid = $props.id();

  let {
    pathId = createId('motionPathId-', uid),
    objectId = createId('motionObjectId-', uid),
    duration,
    repeatCount,
    fill = 'freeze',
    rotate,
    ref = $bindable(),
    children,
    ...restProps
  }: MotionPathPropsWithoutHTML = $props();

  // TODO: Investigate `calcMode:spline`, `keyTimes`, and `keySplines` to work with `svelte/easing`
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/calcMode
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keyTimes
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keySplines
  // https://medium.com/javarevisited/animate-your-scalable-vector-graphics-svg-56f5800cd34b

  // Restart animation anytime the component is remounted (otherwise it only ever plays once)

  $effect(() => {
    if (!ref) return;
    ref.beginElement();
  });
</script>

<defs>
  <animateMotion
    href="#{objectId}"
    dur={duration}
    {repeatCount}
    {fill}
    {rotate}
    bind:this={ref}
    {...createDataAttr('motion-path')}
    {...restProps}
  >
    <mpath href="#{pathId}" />
  </animateMotion>
</defs>

{@render children?.({ pathId, objectId })}
