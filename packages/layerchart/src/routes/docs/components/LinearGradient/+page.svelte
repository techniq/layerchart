<script lang="ts">
  import { Chart, Layer, LinearGradient, Rect } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';
</script>

<h1>Examples</h1>

<h2>Direction with custom colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
          {#snippet children({ gradient })}
            <Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
          {#snippet children({ gradient })}
            <Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Explicit offsets</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <LinearGradient
          stops={[
            ['30%', 'hsl(60 100% 50%)'],
            ['70%', 'hsl(30 100% 40%)'],
          ]}
        >
          {#snippet children({ gradient })}
            <Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient
          stops={[
            ['10%', 'hsl(60 100% 50%)'],
            ['90%', 'hsl(140 100% 40%)'],
          ]}
          rotate={45}
        >
          {#snippet children({ gradient })}
            <Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient
          stops={[
            ['50%', 'hsl(195 100% 50%)'],
            ['50%', 'hsl(270 100% 30%)'],
          ]}
          vertical
        >
          {#snippet children({ gradient })}
            <Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tailwind colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <LinearGradient class="from-pink-500 to-yellow-500" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-green-300 to-purple-600" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-gray-600 to-black" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-pink-300 to-indigo-400" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-yellow-100 to-yellow-500" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-blue-700 to-gray-900" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-sky-300 to-blue-500" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 6} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-red-500 to-red-800" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 7} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-blue-400 to-emerald-400" vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 8} y={0} width={100} height={300} rx={8} fill={gradient} />
          {/snippet}
        </LinearGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>units <small>`objectBoundingBox` (default) vs `userSpaceOnUse`</small></h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <LinearGradient class="from-green-500 to-blue-500" units="objectBoundingBox">
          {#snippet children({ gradient })}
            {#each { length: 6 } as _, i}
              <Rect x={0 + i * 120} y={0} width={100} height={140} rx={8} fill={gradient} />
            {/each}
          {/snippet}
        </LinearGradient>

        <LinearGradient class="from-green-500 to-blue-500" units="userSpaceOnUse">
          {#snippet children({ gradient })}
            {#each { length: 6 } as _, i}
              <Rect x={0 + i * 120} y={160} width={100} height={140} rx={8} fill={gradient} />
            {/each}
          {/snippet}
        </LinearGradient>
      </Layer>
    </Chart>
  </div>
</Preview>
