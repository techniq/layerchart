<script lang="ts">
  export let interpolator: (t: number) => string;
  export let steps = 10;
  export let height: string | number = '20px';
  export let width: string | number = '100%';

  let href = '';
  $: {
    const canvas = document.createElement('canvas');
    canvas.width = steps;
    canvas.height = 1;
    const context = canvas.getContext('2d')!;
    for (let i = 0; i < steps; ++i) {
      context.fillStyle = interpolator(i / (steps - 1));
      context.fillRect(i, 0, 1, 1);
    }
    href = canvas.toDataURL();
  }
</script>

<image {href} preserveAspectRatio="none" style:height style:width {...$$restProps} />
