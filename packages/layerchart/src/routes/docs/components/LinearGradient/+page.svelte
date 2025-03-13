<script lang="ts">
  import { Chart, LinearGradient, Svg } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
</script>

<h1>Examples</h1>

<h2>Direction with custom colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <LinearGradient id="gradient-1" stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']} />
        <LinearGradient
          id="gradient-2"
          stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']}
          rotate={45}
        />
        <LinearGradient
          id="gradient-3"
          stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']}
          vertical
        />
        {#each { length: 3 } as _, i}
          <rect
            x={0 + i * 120}
            y={0}
            width={100}
            height={300}
            rx={8}
            fill="url(#gradient-{i + 1})"
          />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tailwind colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <LinearGradient id="tw-1" class="from-pink-500 to-yellow-500" vertical />
        <LinearGradient id="tw-2" class="from-green-300 to-purple-600" vertical />
        <LinearGradient id="tw-3" class="from-gray-600 to-black" vertical />
        <LinearGradient id="tw-4" class="from-pink-300 to-indigo-400" vertical />
        <LinearGradient id="tw-5" class="from-yellow-100 to-yellow-500" vertical />
        <LinearGradient id="tw-6" class="from-blue-700 to-gray-900" vertical />
        <LinearGradient id="tw-7" class="from-sky-300 to-blue-500" vertical />
        <LinearGradient id="tw-8" class="from-red-500 to-red-800" vertical />
        <LinearGradient id="tw-9" class="from-blue-400 to-emerald-400" vertical />
        {#each { length: 9 } as _, i}
          <rect x={0 + i * 120} y={0} width={100} height={300} rx={8} fill="url(#tw-{i + 1})" />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>units <small>`objectBoundingBox` (default) vs `userSpaceOnUse`</small></h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <LinearGradient class="from-green-500 to-blue-500" units="objectBoundingBox" let:gradient>
          {#each { length: 6 } as _, i}
            <rect x={0 + i * 120} y={0} width={100} height={140} rx={8} fill={gradient} />
          {/each}
        </LinearGradient>

        <LinearGradient class="from-green-500 to-blue-500" units="userSpaceOnUse" let:gradient>
          {#each { length: 6 } as _, i}
            <rect x={0 + i * 120} y={160} width={100} height={140} rx={8} fill={gradient} />
          {/each}
        </LinearGradient>
      </Svg>
    </Chart>
  </div>
</Preview>
