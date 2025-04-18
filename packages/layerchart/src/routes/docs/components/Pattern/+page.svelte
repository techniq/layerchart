<script lang="ts">
  import { Chart, LinearGradient, Pattern, Svg } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
</script>

<h1>Examples</h1>

<h2>Lines</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <Pattern size={4} lines>
          {#snippet children({ pattern })}
            <rect
              x={120 * 0}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={4} lines={{ rotate: 90 }}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 1}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={5} lines={[{ rotate: 0 }, { rotate: 90 }]}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 2}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={5} lines={{ rotate: -45 }}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 3}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={5} lines={{ rotate: 45 }}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 4}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={6} lines={[{ rotate: 45 }, { rotate: -45 }]}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 5}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Circles</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <Pattern size={4} circles>
          {#snippet children({ pattern })}
            <rect
              x={120 * 0}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={8} circles>
          {#snippet children({ pattern })}
            <rect
              x={120 * 1}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={8} circles={{ stagger: true }}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 2}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={8} circles={{ radius: 2 }}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 3}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={8} circles={{ radius: 2, stagger: true }}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 4}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern size={8} circles={{ radius: 2, opacity: 0.3 }}>
          {#snippet children({ pattern })}
            <rect
              x={120 * 5}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Fill color</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <Pattern id="fill-pattern-1" width={4} height={4}>
          {#snippet patternContent()}
            <rect width={4} height={4} fill="hsl(20 100% 50%)" />
            <circle cx={2} cy={2} r={1} fill="#fff4" />
          {/snippet}
        </Pattern>
        <Pattern id="fill-pattern-2" width={8} height={8}>
          {#snippet patternContent()}
            <rect width={8} height={8} fill="hsl(150 100% 45%)" />
            <circle cx={4} cy={4} r={1} fill="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="fill-pattern-3" width={8} height={8}>
          {#snippet patternContent()}
            <rect width={8} height={8} fill="hsl(210 100% 50%)" />
            <circle cx={4} cy={4} r={1} fill="#fff9" />
            <circle cx={0} cy={0} r={1} fill="#fff9" />
            <circle cx={0} cy={8} r={1} fill="#fff9" />
            <circle cx={8} cy={0} r={1} fill="#fff9" />
            <circle cx={8} cy={8} r={1} fill="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="fill-pattern-4" width={8} height={8}>
          {#snippet patternContent()}
            <rect width={8} height={8} fill="hsl(260 100% 50%)" />
            <circle cx={4} cy={4} r={2} fill="#fff9" />
            <circle cx={0} cy={0} r={2} fill="#fff9" />
            <circle cx={0} cy={8} r={2} fill="#fff9" />
            <circle cx={8} cy={0} r={2} fill="#fff9" />
            <circle cx={8} cy={8} r={2} fill="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="fill-pattern-5" width={4} height={4}>
          {#snippet patternContent()}
            <rect width={4} height={4} fill="hsl(40 100% 50%)" />
            <line x2="100%" stroke="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="fill-pattern-6" width={4} height={4}>
          {#snippet patternContent()}
            <rect width={4} height={4} fill="hsl(360 100% 40%)" />
            <line x2="100%" stroke="#0003" />
            <line y2="100%" stroke="#0003" />
          {/snippet}
        </Pattern>
        {#each { length: 6 } as _, i}
          <rect
            x={0 + i * 120}
            y={0}
            width={100}
            height={300}
            rx={8}
            fill="url(#fill-pattern-{i + 1})"
          />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With LinearGradient</h2>

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
        <LinearGradient id="gradient-4" stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']} />
        <LinearGradient
          id="gradient-5"
          stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']}
          rotate={45}
        />
        <LinearGradient
          id="gradient-6"
          stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']}
          vertical
        />
        <Pattern id="gradient-with-pattern-1" width={4} height={4}>
          {#snippet patternContent()}
            <circle cx={2} cy={2} r={1} fill="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-with-pattern-2" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={1} fill="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-with-pattern-3" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={1} fill="#fff9" />
            <circle cx={0} cy={0} r={1} fill="#fff9" />
            <circle cx={0} cy={8} r={1} fill="#fff9" />
            <circle cx={8} cy={0} r={1} fill="#fff9" />
            <circle cx={8} cy={8} r={1} fill="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-with-pattern-4" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={2} fill="#fff9" />
            <circle cx={0} cy={0} r={2} fill="#fff9" />
            <circle cx={0} cy={8} r={2} fill="#fff9" />
            <circle cx={8} cy={0} r={2} fill="#fff9" />
            <circle cx={8} cy={8} r={2} fill="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-with-pattern-5" width={4} height={4}>
          {#snippet patternContent()}
            <line x2="100%" stroke="#fff9" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-with-pattern-6" width={4} height={4}>
          {#snippet patternContent()}
            <line x2="100%" stroke="#0003" />
            <line y2="100%" stroke="#0003" />
          {/snippet}
        </Pattern>
        {#each { length: 6 } as _, i}
          <rect
            x={0 + i * 120}
            y={0}
            width={100}
            height={300}
            rx={8}
            fill="url(#gradient-{i + 1})"
          />
          <rect
            x={0 + i * 120}
            y={0}
            width={100}
            height={300}
            rx={8}
            fill="url(#gradient-with-pattern-{i + 1})"
          />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>LinearGradient as Pattern</h2>

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
        <Pattern id="gradient-pattern-1" width={4} height={4}>
          {#snippet patternContent()}
            <rect width={4} height={4} fill="url(#gradient-1)" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-pattern-2" width={4} height={4}>
          {#snippet patternContent()}
            <rect width={4} height={4} fill="url(#gradient-2)" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-pattern-3" width={4} height={4}>
          {#snippet patternContent()}
            <rect width={4} height={4} fill="url(#gradient-3)" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-pattern-4" width={8} height={8}>
          {#snippet patternContent()}
            <rect width={8} height={8} fill="url(#gradient-1)" />
          {/snippet}
        </Pattern>
        <Pattern id="gradient-pattern-5" width={8} height={8}>
          {#snippet patternContent()}
            <rect width={8} height={8} fill="url(#gradient-2)" />
          {/snippet}
        </Pattern>
        {#each { length: 5 } as _, i}
          <rect
            x={0 + i * 120}
            y={0}
            width={100}
            height={300}
            rx={8}
            fill="url(#gradient-pattern-{i + 1})"
          />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Lines (custom pattern)</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <Pattern width={4} height={4}>
          {#snippet patternContent()}
            <line x2="100%" class="stroke-surface-content" />
          {/snippet}

          {#snippet children({ pattern })}
            <rect
              x={120 * 0}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern width={4} height={4}>
          {#snippet patternContent()}
            <line y2="100%" class="stroke-surface-content" />
          {/snippet}

          {#snippet children({ pattern })}
            <rect
              x={120 * 1}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern width={4} height={4}>
          {#snippet patternContent()}
            <line x2="100%" class="stroke-surface-content" />
            <line y2="100%" class="stroke-surface-content" />
          {/snippet}

          {#snippet children({ pattern })}
            <rect
              x={120 * 2}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern width={8} height={8}>
          {#snippet patternContent()}
            <line x1={8} y2={8} class="stroke-surface-content" />
          {/snippet}

          {#snippet children({ pattern })}
            <rect
              x={120 * 3}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern width={8} height={8}>
          {#snippet patternContent()}
            <line x2={8} y2={8} class="stroke-surface-content" />
          {/snippet}

          {#snippet children({ pattern })}
            <rect
              x={120 * 4}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>

        <Pattern width={8} height={8}>
          {#snippet patternContent()}
            <line x1={8} y2={8} class="stroke-surface-content" />
            <line x2={8} y2={8} class="stroke-surface-content" />
          {/snippet}

          {#snippet children({ pattern })}
            <rect
              x={120 * 5}
              y={0}
              width={100}
              height={300}
              rx={8}
              fill={pattern}
              class="stroke-surface-content"
            />
          {/snippet}
        </Pattern>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Circles (custom pattern)</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Svg>
        <Pattern id="circle-pattern-1" width={4} height={4}>
          {#snippet patternContent()}
            <circle cx={2} cy={2} r={1} class="fill-surface-content" />
          {/snippet}
        </Pattern>

        <Pattern id="circle-pattern-2" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={1} class="fill-surface-content" />
          {/snippet}
        </Pattern>

        <Pattern id="circle-pattern-3" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={2} class="fill-surface-content" />
          {/snippet}
        </Pattern>

        <Pattern id="circle-pattern-4" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={2} class="fill-surface-content" />
            <circle cx={0} cy={0} r={2} class="fill-surface-content" />
            <circle cx={0} cy={8} r={2} class="fill-surface-content" />
            <circle cx={8} cy={0} r={2} class="fill-surface-content" />
            <circle cx={8} cy={8} r={2} class="fill-surface-content" />
          {/snippet}
        </Pattern>

        <Pattern id="circle-pattern-5" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={1} class="fill-surface-content" />
            <circle cx={0} cy={0} r={1} class="fill-surface-content" />
            <circle cx={0} cy={8} r={1} class="fill-surface-content" />
            <circle cx={8} cy={0} r={1} class="fill-surface-content" />
            <circle cx={8} cy={8} r={1} class="fill-surface-content" />
          {/snippet}
        </Pattern>

        <Pattern id="circle-pattern-6" width={8} height={8}>
          {#snippet patternContent()}
            <circle cx={4} cy={4} r={2} class="fill-surface-content/30" />
          {/snippet}
        </Pattern>

        {#each { length: 6 } as _, i}
          <rect
            x={0 + i * 120}
            y={0}
            width={100}
            height={300}
            rx={8}
            fill="url(#circle-pattern-{i + 1})"
            class="stroke-surface-content"
          />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>
