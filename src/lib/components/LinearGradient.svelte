<script lang="ts">
  export let id: string;

  export let from: string | boolean;
  export let via: string | undefined = undefined; // TODO: Currently --tw-gradient-via is not the color but the full stops
  export let to: string | boolean;

  export let vertical = false;
  export let x1 = '0%';
  export let y1 = '0%';
  export let x2 = vertical ? '0%' : '100%';
  export let y2 = vertical ? '100%' : '0%';

  export let rotate: number | undefined = undefined;
</script>

<defs>
  <linearGradient
    {id}
    {x1}
    {y1}
    {x2}
    {y2}
    gradientTransform={rotate ? `rotate(${rotate})` : ''}
    {...$$restProps}
  >
    <slot>
      {#if from}
        <stop offset="0%" stop-color={from === true ? 'var(--tw-gradient-from)' : from} />
      {/if}

      {#if via}
        <!-- <stop offset="50%" stop-color={via === true ? 'var(--tw-gradient-via)' : via} /> -->
        <stop offset="50%" stop-color={via} />
      {/if}

      {#if to}
        <stop offset="100%" stop-color={to === true ? 'var(--tw-gradient-to)' : to} />
      {/if}
    </slot>
  </linearGradient>
</defs>
