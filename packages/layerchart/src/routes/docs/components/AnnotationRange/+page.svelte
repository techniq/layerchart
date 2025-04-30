<script lang="ts">
  import { AnnotationRange, Canvas, LineChart, Svg } from 'layerchart';
  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  let renderContext: 'svg' | 'canvas' = $state('svg');
  // @ts-expect-error - ignore
  const RenderComponent = $derived(renderContext === 'canvas' ? Canvas : Svg);

  let debug = $state(false);

  // Get a few random points to use for annotations
  const annotations = $derived(
    [...data.appleStock]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .sort(sortFunc('date'))
      .map((d, i) => ({
        x: d.date,
        y: d.value,
        label: String.fromCharCode(65 + i),
        details: `This is an annotation for ${format(d.date)}`,
      }))
  );
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2">
  <Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>

  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<h2>Horizontal with pattern, lower bound</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange
          y={[500, null]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Horizontal with pattern, upper bound</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange
          y={[null, 500]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Horizontal with pattern, range</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange
          y={[300, 500]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Horizontal with fill, multiple</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange y={[0, 400]} class="fill-success/10" />
        <AnnotationRange y={[400, 600]} class="fill-warning/10" />
        <AnnotationRange y={[600, null]} class="fill-danger/10" />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Vertical with pattern, lower bound</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange
          x={[new Date('2010-01-01'), null]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Vertical with pattern, upper bound</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange
          x={[null, new Date('2010-12-31')]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Vertical with pattern, range</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange
          x={[new Date('2010-01-01'), new Date('2010-12-31')]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Vertical with gradient, range</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks({ context })}
        <AnnotationRange
          x={[new Date('2011-01-01'), new Date('2011-06-30')]}
          gradient={{
            class: 'from-danger/30 to-danger/1',
            vertical: true,
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>
