<script lang="ts">
  import { Chart, RadialGradient, Svg } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  const radius = 50;
</script>

<h1>Examples</h1>

<h2>Focal location and radius with custom colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded">
    <Chart>
      <Svg>
        <RadialGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']} let:gradient>
          <circle cx={radius + 0 * 120} cy={radius} r={radius} fill={gradient} />
        </RadialGradient>

        <RadialGradient
          stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']}
          fx="20%"
          fy="20%"
          let:gradient
        >
          <circle cx={radius + 1 * 120} cy={radius} r={radius} fill={gradient} />
        </RadialGradient>

        <RadialGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} r="30%" let:gradient>
          <circle cx={radius + 2 * 120} cy={radius} r={radius} fill={gradient} />
        </RadialGradient>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tailwind colors</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded">
    <Chart>
      <Svg>
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
          <circle cx={radius + i * 120} cy={radius} r={radius} fill="url(#tw-{i + 1})" />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>spreadMethod</h2>

<Preview>
  <div class="h-[252px] p-4 border rounded">
    <Chart>
      <Svg>
        <RadialGradient class="from-green-500 to-blue-500" r="30%" spreadMethod="pad" let:gradient>
          <circle cx={radius + 0 * 120} cy={radius} r={radius} fill={gradient} />
        </RadialGradient>

        <RadialGradient
          class="from-green-500 to-blue-500"
          r="30%"
          spreadMethod="reflect"
          let:gradient
        >
          <circle cx={radius + 1 * 120} cy={radius} r={radius} fill={gradient} />
        </RadialGradient>

        <RadialGradient
          class="from-green-500 to-blue-500"
          r="30%"
          spreadMethod="repeat"
          let:gradient
        >
          <circle cx={radius + 2 * 120} cy={radius} r={radius} fill={gradient} />
        </RadialGradient>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>units <small>`objectBoundingBox` (default) vs `userSpaceOnUse`</small></h2>

<Preview>
  <div class="h-[252px] p-4 border rounded">
    <Chart>
      <Svg>
        <RadialGradient class="from-green-500 to-blue-500" units="objectBoundingBox" let:gradient>
          {#each { length: 6 } as _, i}
            <circle cx={radius + i * 120} cy={radius} r={radius} fill={gradient} />
          {/each}
        </RadialGradient>

        <RadialGradient class="from-green-500 to-blue-500" units="userSpaceOnUse" let:gradient>
          {#each { length: 6 } as _, i}
            <circle cx={radius + i * 120} cy={120 + radius} r={radius} fill={gradient} />
          {/each}
        </RadialGradient>
      </Svg>
    </Chart>
  </div>
</Preview>
