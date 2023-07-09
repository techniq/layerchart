<script lang="ts">
  import { onMount } from 'svelte';
  import { uniqueId } from 'svelte-ux';

  /** Id of path to move object along */
  export let pathId: string = uniqueId('motionPathId-');

  /** Id of object to move along path */
  export let objectId: string = uniqueId('motionObjectId-');

  /** Duration of the animation */
  export let duration: string;

  /** Number of times the animation will occur */
  export let repeatCount: number | 'indefinite' | undefined = 1;

  /** Final state of the animation.  Freeze (last frame) or remove (first frame)
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill#animate
   * */
  export let fill: 'freeze' | 'remove' = 'freeze';

  // TODO: Investigate `calcMode:spline`, `keyTimes`, and `keySplines` to work with `svelte/easing`
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/calcMode
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keyTimes
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keySplines
  // https://medium.com/javarevisited/animate-your-scalable-vector-graphics-svg-56f5800cd34b

  // Restart animation anytime the component is remounted (otherwise it only ever plays once)
  let animateEl: SVGAnimateMotionElement;
  onMount(() => {
    animateEl.beginElement();
  });
</script>

<defs>
  <animateMotion href="#{objectId}" dur={duration} {repeatCount} {fill} bind:this={animateEl}>
    <mpath href="#{pathId}" />
  </animateMotion>
</defs>

{#if $$slots.default}
  <slot {pathId} {objectId} />
{/if}
