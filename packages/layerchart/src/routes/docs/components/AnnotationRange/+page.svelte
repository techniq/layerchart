<script lang="ts">
  import { AnnotationRange, LineChart, type Placement } from 'layerchart';
  import {
    Button,
    Field,
    Menu,
    RangeField,
    Switch,
    Toggle,
    ToggleGroup,
    ToggleOption,
  } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  const placementOptions = [
    'top-left',
    'top',
    'top-right',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right',
  ] as const;
  let placement: Placement = $state('center');
  let xOffset = $state(0);
  let yOffset = $state(0);

  let renderContext: 'svg' | 'canvas' = $state('svg');
  let debug = $state(false);
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

<h2>Label placement</h2>

<div class="grid grid-cols-3 gap-2 mb-2">
  <Toggle let:on={open} let:toggle>
    <Field label="Placement" class="cursor-pointer" on:click={toggle}>
      <span class="text-sm">
        {placement}
      </span>
    </Field>

    <Menu {open} on:close={toggle} placement="bottom-start">
      <div class="grid grid-cols-3 gap-1 p-1">
        {#each placementOptions as option}
          <Button
            variant="outline"
            color={option === placement ? 'primary' : 'default'}
            on:click={() => (placement = option)}
          >
            {option}
          </Button>
        {/each}
      </div>
    </Menu>
  </Toggle>

  <RangeField label="X offset" bind:value={xOffset} max={10} />
  <RangeField label="Y offset" bind:value={yOffset} max={10} />
</div>

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
      {#snippet aboveMarks({ context })}
        <AnnotationRange
          x={[new Date('2010-01-01'), new Date('2010-12-31')]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
          label={placement}
          labelPlacement={placement}
          labelXOffset={xOffset}
          labelYOffset={yOffset}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>
