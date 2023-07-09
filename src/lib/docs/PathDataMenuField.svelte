<script lang="ts">
  import { onMount } from 'svelte';
  import * as easings from 'svelte/easing';

  import { MenuField } from 'svelte-ux';

  export let value: any | undefined = undefined;

  // TODO: Allow updating externally without loosing selection
  export let amplitude = 1;
  export let frequency = 10;
  export let phase = 0;

  $: mathOptions = [
    {
      label: 'sin',
      group: 'math',
      value: (x: number) => amplitude * Math.sin(x * frequency) + phase
    },
    {
      label: 'cos',
      group: 'math',
      value: (x: number) => amplitude * Math.cos(x * frequency) + phase
    },
    {
      label: 'tan',
      group: 'math',
      value: (x: number) => amplitude * Math.tan(x * frequency) + phase
    },
    {
      label: 'sqrt',
      group: 'math',
      value: (x: number) => amplitude * Math.sqrt(x * frequency) + phase
    },
    {
      label: 'ceil',
      group: 'math',
      value: (x: number) => amplitude * Math.ceil(x * frequency) + phase
    },
    {
      label: 'floor',
      group: 'math',
      value: (x: number) => amplitude * Math.floor(x * frequency) + phase
    },
    {
      label: 'round',
      group: 'math',
      value: (x: number) => amplitude * Math.round(x * frequency) + phase
    },
    { label: 'random', group: 'math', value: (x: number) => amplitude * Math.random() + phase },
    {
      label: 'pow',
      group: 'math',
      value: (x: number) => amplitude * Math.pow(x, frequency) + phase
    }
  ];

  const easingOptions = Object.entries(easings).map(([key, value]) => {
    return {
      label: key,
      value,
      group: 'easing'
    };
  });

  $: options = [...mathOptions, ...easingOptions];

  // Select initial option
  onMount(() => {
    value = options[0].value;
  });
</script>

<MenuField label="Path data" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
