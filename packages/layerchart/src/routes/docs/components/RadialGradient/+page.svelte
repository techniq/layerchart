<script lang="ts">
  import { Chart, Circle, Layer, RadialGradient, Svg } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

  const radius = 50;
  let renderContext: 'svg' | 'canvas' = $state('svg');
</script>

<h1>Examples</h1>

<!-- <div class="grid grid-cols-[1fr_auto] gap-2">
  <Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>
</div> -->

<h2>Focal location and radius with custom colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={renderContext}>
        <RadialGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
          {#snippet children({ gradient })}
            <Circle cx={radius + 0 * 120} cy={radius} r={radius} fill={gradient} />
          {/snippet}
        </RadialGradient>

        <RadialGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} fx="20%" fy="20%">
          {#snippet children({ gradient })}
            <Circle cx={radius + 1 * 120} cy={radius} r={radius} fill={gradient} />
          {/snippet}
        </RadialGradient>

        <RadialGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} r="30%">
          {#snippet children({ gradient })}
            <Circle cx={radius + 2 * 120} cy={radius} r={radius} fill={gradient} />
          {/snippet}
        </RadialGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tailwind colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={renderContext}>
        <RadialGradient id="tw-1" class="from-pink-500 to-yellow-500" />
        <RadialGradient id="tw-2" class="from-green-300 to-purple-600" />
        <RadialGradient id="tw-3" class="from-gray-600 to-black" />
        <RadialGradient id="tw-4" class="from-pink-300 to-indigo-400" />
        <RadialGradient id="tw-5" class="from-yellow-100 to-yellow-500" />
        <RadialGradient id="tw-6" class="from-blue-700 to-gray-900" />
        <RadialGradient id="tw-7" class="from-sky-300 to-blue-500" />
        <RadialGradient id="tw-8" class="from-red-500 to-red-800" />
        <RadialGradient id="tw-9" class="from-blue-400 to-emerald-400" />
        {#each { length: 9 } as _, i}
          <Circle cx={radius + i * 120} cy={radius} r={radius} fill="url(#tw-{i + 1})" />
        {/each}
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>spreadMethod</h2>

<Preview>
  <div class="h-[252px] p-4 border rounded-sm">
    <Chart>
      <Layer type={renderContext}>
        <RadialGradient class="from-green-500 to-blue-500" r="30%" spreadMethod="pad">
          {#snippet children({ gradient })}
            <Circle cx={radius + 0 * 120} cy={radius} r={radius} fill={gradient} />
          {/snippet}
        </RadialGradient>

        <RadialGradient class="from-green-500 to-blue-500" r="30%" spreadMethod="reflect">
          {#snippet children({ gradient })}
            <Circle cx={radius + 1 * 120} cy={radius} r={radius} fill={gradient} />
          {/snippet}
        </RadialGradient>

        <RadialGradient class="from-green-500 to-blue-500" r="30%" spreadMethod="repeat">
          {#snippet children({ gradient })}
            <Circle cx={radius + 2 * 120} cy={radius} r={radius} fill={gradient} />
          {/snippet}
        </RadialGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>units <small>`objectBoundingBox` (default) vs `userSpaceOnUse`</small></h2>

<Preview>
  <div class="h-[252px] p-4 border rounded-sm">
    <Chart>
      <Layer type={renderContext}>
        <RadialGradient class="from-green-500 to-blue-500" units="objectBoundingBox">
          {#snippet children({ gradient })}
            {#each { length: 6 } as _, i}
              <Circle cx={radius + i * 120} cy={radius} r={radius} fill={gradient} />
            {/each}
          {/snippet}
        </RadialGradient>

        <RadialGradient class="from-green-500 to-blue-500" units="userSpaceOnUse">
          {#snippet children({ gradient })}
            {#each { length: 6 } as _, i}
              <Circle cx={radius + i * 120} cy={120 + radius} r={radius} fill={gradient} />
            {/each}
          {/snippet}
        </RadialGradient>
      </Layer>
    </Chart>
  </div>
</Preview>
