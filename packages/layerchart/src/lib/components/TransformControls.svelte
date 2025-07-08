<script lang="ts" module>
  import type { Placement } from './types.js';

  type Actions = 'zoomIn' | 'zoomOut' | 'center' | 'reset' | 'scrollMode';

  export type TransformControlsPropsWithoutHTML = {
    /**
     * @default 'top-right'
     */
    placement?: Placement;

    /**
     * @default 'vertical'
     */
    orientation?: 'horizontal' | 'vertical';

    /**
     * @default 'md'
     */
    size?: ComponentProps<Button>['size'];

    /**
     * @default ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode']
     */
    show?: Actions[];
  };

  export type TransformControlsProps = TransformControlsPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, TransformControlsPropsWithoutHTML>;
</script>

<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { Button, Icon, MenuButton, Tooltip } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  import LucideFocus from '~icons/lucide/focus';
  import LucideChevronDown from '~icons/lucide/chevron-down';
  import LucideCircleOff from '~icons/lucide/circle-off';
  import LucideImageUpscale from '~icons/lucide/image-upscale';
  import LucideMove from '~icons/lucide/move';
  import LucideUndo2 from '~icons/lucide/undo-2';
  import LucideZoomIn from '~icons/lucide/zoom-in';
  import LucideZoomOut from '~icons/lucide/zoom-out';

  import { getTransformContext } from './TransformContext.svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    placement = 'top-right',
    orientation = 'vertical',
    size = 'md',
    show = ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode'],
    class: className,
  }: TransformControlsProps = $props();

  const menuPlacementByOrientationAndPlacement = $derived({
    horizontal: {
      'top-left': 'bottom-end',
      top: 'bottom-end',
      'top-right': 'bottom-end',
      left: 'bottom-end',
      center: 'bottom-end',
      right: 'bottom-end',
      'bottom-left': 'top-end',
      bottom: 'top-end',
      'bottom-right': 'top-end',
    },
    vertical: {
      'top-left': 'right-start',
      top: 'right-start',
      'top-right': 'left-start',
      left: 'right-start',
      center: 'right-start',
      right: 'left-start',
      'bottom-left': 'right-end',
      bottom: 'right-end',
      'bottom-right': 'left-end',
    },
  } as const);

  const transform = getTransformContext();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={cls(
    'bg-surface-300/50 border rounded-full m-1 backdrop-blur-sm z-10 flex',
    orientation === 'vertical' && 'flex-col',
    {
      'top-left': 'absolute top-0 left-0',
      top: 'absolute top-0 left-1/2 -translate-x-1/2',
      'top-right': 'absolute top-0 right-0',
      left: 'absolute top-1/2 left-0 -translate-y-1/2',
      center: 'absolute top-1/2 left-1/2 -translate-x-1/2  -translate-y-1/2',
      right: 'absolute top-1/2 right-0 -translate-y-1/2',
      'bottom-left': 'absolute bottom-0 left-0',
      bottom: 'absolute bottom-0 left-1/2 -translate-x-1/2',
      'bottom-right': 'absolute bottom-0 right-0',
    }[placement],
    className
  )}
  ondblclick={(e) => {
    // Stop from propagating to TransformContext
    e.stopPropagation();
  }}
>
  {#if show.includes('zoomIn')}
    <Tooltip title="Zoom in">
      <Button
        icon={LucideZoomIn}
        on:click={() => transform.zoomIn()}
        {size}
        class="text-surface-content p-2"
      />
    </Tooltip>
  {/if}

  {#if show.includes('zoomOut')}
    <Tooltip title="Zoom out">
      <Button
        icon={LucideZoomOut}
        on:click={() => transform.zoomOut()}
        {size}
        class="text-surface-content p-2"
      />
    </Tooltip>
  {/if}

  {#if show.includes('center')}
    <Tooltip title="Center">
      <Button
        icon={LucideFocus}
        on:click={() => transform.translateCenter()}
        {size}
        class="text-surface-content p-2"
      />
    </Tooltip>
  {/if}

  {#if show.includes('reset')}
    <Tooltip title="Reset">
      <Button
        icon={LucideUndo2}
        on:click={() => transform.reset()}
        {size}
        class="text-surface-content p-2"
      />
    </Tooltip>
  {/if}

  {#if show.includes('scrollMode')}
    <Tooltip title="Scroll mode">
      <MenuButton
        iconOnly
        options={[
          { label: 'None', value: 'none', icon: LucideCircleOff },
          { label: 'Zoom', value: 'scale', icon: LucideImageUpscale },
          { label: 'Move', value: 'translate', icon: LucideMove },
        ]}
        menuProps={{ placement: menuPlacementByOrientationAndPlacement[orientation][placement] }}
        menuIcon={null}
        {size}
        value={transform.scrollMode}
        on:change={(e) => transform.setScrollMode(e.detail.value)}
        class="text-surface-content"
      >
        <svelte:fragment slot="selection" let:value>
          <Icon data={value?.icon ?? LucideChevronDown} />
        </svelte:fragment>
      </MenuButton>
    </Tooltip>
  {/if}
</div>
