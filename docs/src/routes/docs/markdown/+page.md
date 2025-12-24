# Docs features

## Syntax highlighting

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
