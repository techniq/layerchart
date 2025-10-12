<script lang="ts">
  import { Chart, Layer, LinearGradient, Pattern, Rect } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';
</script>

<h1>Examples</h1>

<h2>Lines</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <Pattern size={4} lines>
          {#snippet children({ pattern })}
            <Rect
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
            <Rect
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
            <Rect
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
            <Rect
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
            <Rect
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
            <Rect
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
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Circles</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <Pattern size={4} circles>
          {#snippet children({ pattern })}
            <Rect
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
            <Rect
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
            <Rect
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
            <Rect
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
            <Rect
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
            <Rect
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
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>With Fill color</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <Pattern size={4} circles={{ color: 'white', opacity: 0.25 }} background="hsl(20 100% 50%)">
          {#snippet children({ pattern })}
            <Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={pattern} />
          {/snippet}
        </Pattern>

        <Pattern size={8} circles={{ color: 'white', opacity: 0.6 }} background="hsl(150 100% 45%)">
          {#snippet children({ pattern })}
            <Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={pattern} />
          {/snippet}
        </Pattern>

        <Pattern
          size={8}
          circles={{ color: 'white', opacity: 0.6, stagger: true }}
          background="hsl(210 100% 50%)"
        >
          {#snippet children({ pattern })}
            <Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={pattern} />
          {/snippet}
        </Pattern>

        <Pattern
          size={8}
          circles={{ color: 'white', opacity: 0.6, stagger: true, radius: 2 }}
          background="hsl(260 100% 50%)"
        >
          {#snippet children({ pattern })}
            <Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={pattern} />
          {/snippet}
        </Pattern>

        <Pattern size={4} lines={{ color: 'white', opacity: 0.5 }} background="hsl(40 100% 50%)">
          {#snippet children({ pattern })}
            <Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={pattern} />
          {/snippet}
        </Pattern>

        <Pattern
          size={4}
          lines={[
            { color: 'black', opacity: 0.1 },
            { color: 'black', opacity: 0.1, rotate: 90 },
          ]}
          background="hsl(360 100% 40%)"
        >
          {#snippet children({ pattern })}
            <Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={pattern} />
          {/snippet}
        </Pattern>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>With LinearGradient</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
          {#snippet children({ gradient })}
            <Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />

            <Pattern size={4} circles={{ color: 'white', opacity: 0.5 }}>
              {#snippet children({ pattern })}
                <Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
          {#snippet children({ gradient })}
            <Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />

            <Pattern size={8} circles={{ color: 'white', opacity: 0.5 }}>
              {#snippet children({ pattern })}
                <Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />

            <Pattern size={8} circles={{ color: 'white', opacity: 0.5, stagger: true }}>
              {#snippet children({ pattern })}
                <Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
          {#snippet children({ gradient })}
            <Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={gradient} />

            <Pattern size={8} circles={{ color: 'white', opacity: 0.5, stagger: true, radius: 2 }}>
              {#snippet children({ pattern })}
                <Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
          {#snippet children({ gradient })}
            <Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={gradient} />

            <Pattern size={4} lines={{ color: 'white', opacity: 0.5 }}>
              {#snippet children({ pattern })}
                <Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
          {#snippet children({ gradient })}
            <Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={gradient} />

            <Pattern
              size={4}
              lines={[
                { color: 'black', opacity: 0.1 },
                { color: 'black', opacity: 0.1, rotate: 90 },
              ]}
            >
              {#snippet children({ pattern })}
                <Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>LinearGradient as Pattern</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
          {#snippet children({ gradient })}
            <Pattern size={4} background={gradient}>
              {#snippet children({ pattern })}
                <Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
          {#snippet children({ gradient })}
            <Pattern size={4} background={gradient}>
              {#snippet children({ pattern })}
                <Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
          {#snippet children({ gradient })}
            <Pattern size={4} background={gradient}>
              {#snippet children({ pattern })}
                <Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
          {#snippet children({ gradient })}
            <Pattern size={8} background={gradient}>
              {#snippet children({ pattern })}
                <Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>

        <LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
          {#snippet children({ gradient })}
            <Pattern size={8} background={gradient}>
              {#snippet children({ pattern })}
                <Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={pattern} />
              {/snippet}
            </Pattern>
          {/snippet}
        </LinearGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Lines (custom pattern - svg only)</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
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
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Circles (custom pattern - svg only)</h2>

<Preview>
  <div class="h-[334px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.layer}>
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
      </Layer>
    </Chart>
  </div>
</Preview>
