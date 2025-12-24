<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import Code from '$lib/components/Code.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Steps from '$lib/components/Steps.svelte';
	import Step from '$lib/components/Step.svelte';

	let source = `
< lang='ts'>
	import { Chart, Layer, Text } from 'layerchart';
</` + `script>

<Chart height={80}>
  <Layer center>
		<Text value="Text" />
	</Layer>
</Chart>
`
</script>

# Docs features

## Syntax highlighting

### via Markdown

````md
```svelte
<script lang="ts">
	let { data } = $props();
</script>

<div>Test</div>
```
````

```svelte
<script lang="ts">
	let { data } = $props();
</script>

<div>Test</div>
```

#### Via `<Code />`

````md
<Code language="ts" {source} />
````

<Code language="ts" {source} />

### `<Example />`

TODO: individually support turn off options for Code, Data, View, Edit

#### Using component/name
````md
<Example component="Pie" name="basic" />
````
<Example component="Pie" name="basic" />

#### Using path
````md
<Example path="../../../examples/components/Area/basic.svelte" />
````
<Example path="../../../examples/components/Area/basic.svelte" />


### Diff

````md
<!-- prettier-ignore -->
```svelte diff
<script lang="ts">
  let { data } = $props();
</script>

- <div>Before</div>
+ <div>After</div>
```
````

<!-- prettier-ignore -->
```svelte diff
<script lang="ts">
  let { data } = $props();
</script>

- <div>Before</div>
+ <div>After</div>
```

### Line highlighting

````md
<!-- prettier-ignore -->
```svelte {2,5-7}
<script lang="ts">
	let { data } = $props();
</script>

<div>Line 5</div>
<div>Line 6</div>
<div>Line 7</div>
```
````

<!-- prettier-ignore -->
```svelte {2,5-7}
<script lang="ts">
	let { data } = $props();
</script>

<div>Line 5</div>
<div>Line 6</div>
<div>Line 7</div>
```

### Title (file)

````md
```svelte title="+layout.svelte"
<script lang="ts">
	let { data } = $props();
</script>

<div>Test</div>
```
````

```svelte title="+layout.svelte"
<script lang="ts">
	let { data } = $props();
</script>

<div>Test</div>
```

### Live Code

```svelte live title="Counter.svelte"
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</button>

<style>
	button {
		padding: 0.5rem 1rem;
		background: purple;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}
</style>
```

## Table

```md
| First | Second | Third |
| ----- | ------ | ----- |
| 1     | 2      | 3     |
| 4     | 5      | 6     |
```

| First | Second | Third |
| ----- | ------ | ----- |
| 1     | 2      | 3     |
| 4     | 5      | 6     |

## Tabs

````svelte
<Tabs keys={['Example component/name','Example path','Code', 'Inline markdown']} classes={{ root: "", tab:'', content: 'p-0' }} >
	{#snippet content(value)}
		{#if value === 0}
			<Example component="PieChart" name="basic" noResize/>
		{:else if value === 1}
			<Example path="../../../examples/components/LineChart/basic.svelte" />
		{:else if value === 2}
			<Code language="ts" {source} />
		{:else if value === 3}
			BROKEN
		{/if}
	{/snippet}
</Tabs>
````

TODO - figure out fixed height to prevent layout shifts of tab change

<Tabs keys={['Example component/name','Example path','Code', 'Inline markdown']} classes={{ root: "", tab:'', content: 'p-0' }} >
	{#snippet content(value)}
		{#if value === 0}
			<Example component="PieChart" name="basic" noResize/>
		{:else if value === 1}
			<Example path="../../../examples/components/LineChart/basic.svelte" />
		{:else if value === 2}
			<Code language="ts" {source} />
		{:else if value === 3}
			BROKEN
		{/if}
	{/snippet}
</Tabs>

## Steps

````md
```svelte
<script lang='ts'>
	import Steps from '$lib/components/Steps.svelte';
	import Step from '$lib/components/Step.svelte';
</script>

<Steps>
	<Step title="Step 1" >
		<p class="text-surface-content pt-2">
			Step 1 Content
		</p>
	</Step>
	<Step title="Step 2">
		<p class="text-surface-content pt-2">
			Step 2 Content
		</p>
	</Step>
	<Step title="Step 3" >
		<p class="text-surface-content pt-2">
			Step 3 Content
		</p>
	</Step>
</Steps>
```
````

<Steps>
	<Step title="Step 1" >
		<p class="text-surface-content pt-2">
			Step 1 Content
		</p>
	</Step>
	<Step title="Step 2">
		<p class="text-surface-content pt-2">
			Step 2 Content
		</p>
	</Step>
	<Step title="Step 3" >
		<p class="text-surface-content pt-2">
			Step 3 Content
		</p>
	</Step>
</Steps>

