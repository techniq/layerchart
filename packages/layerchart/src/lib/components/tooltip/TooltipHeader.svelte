<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type TooltipHeaderProps = {
    /**
     * The value to display in the tooltip header when the `children`
     * snippet is not provided.
     */
    value?: any;

    /**
     * The format to use when displaying the value.
     */
    format?: FormatType;

    /**
     * The color to use for the color dot.
     */
    color?: string;

    /**
     * Classes to apply to the parts of the tooltip header.
     */
    classes?: {
      root?: string;
      color?: string;
    };

    /**
     * Props to pass to the underlying elements rendered
     */
    props?: {
      root?: HTMLAttributes<HTMLElement>;
      color?: HTMLAttributes<HTMLElement>;
    };

    /**
     * A reference to the tooltip header's outermost `<div>` tag.
     */
    ref?: HTMLElement;

    /**
     * A reference to the tooltip header's color `<div>` tag.
     */
    colorRef?: HTMLElement;

    children?: Snippet;
  };
</script>

<script lang="ts">
  import { format as formatUtil, type FormatType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  let {
    ref = $bindable(),
    colorRef = $bindable(),
    value,
    format,
    color,
    classes = {
      root: '',
      color: '',
    },
    props = {
      root: {},
      color: {},
    },
    children,
  }: TooltipHeaderProps = $props();
</script>

<div
  class={cls(
    'TooltipHeader',
    'font-semibold whitespace-nowrap border-b mb-1 pb-1 flex items-center gap-2',
    classes.root,
    props.root?.class
  )}
  bind:this={ref}
>
  {#if color}
    <div
      bind:this={colorRef}
      class={cls('color', 'inline-block size-2 rounded-full bg-[var(--color)]', classes.color)}
      style:--color={color}
    ></div>
  {/if}
  {#if children}
    {@render children?.()}
  {:else}
    {format ? formatUtil(value, format) : value}
  {/if}
</div>
