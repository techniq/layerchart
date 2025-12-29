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

## Line numbers

````md
```svelte showLineNumbers
<script lang="ts">
	let { data } = $props();
</script>

<div>Test</div>
```
````

```svelte showLineNumbers
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

```md
``svelte live title="Counter.svelte"

<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
Clicked {count}
{count === 1 ? 'time' : 'times'}
</button>
```

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

### Example

```md
:example{component="LineChart" name="basic" showCode=true}
```

:example{component="LineChart" name="basic" showCode=true}

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

## Directives

### Note

```md
:::note
Here's some additional information. This uses the new `:::note` directive syntax!
:::
```

:::note
Here's some additional information. This uses the new `:::note` directive syntax!
:::

### Tip

```md
:::tip
Here's a helpful suggestion using the `:::tip` directive.
:::
```

:::tip
Here's a helpful suggestion using the `:::tip` directive.
:::

### Warning

```md
:::warning
Be careful with this action as it might have unexpected results. This uses `:::warning`.
:::
```

:::warning
Be careful with this action as it might have unexpected results. This uses `:::warning`.
:::

### Caution

```md
:::caution
This action cannot be undone. This uses `:::caution`.
:::
```

:::caution
This action cannot be undone. This uses `:::caution`.
:::

### Steps

````md
:::steps

## Install dependencies

First, install the required packages:

```bash
npm install layerchart
```

## Configure

Do something else

## ???

## Profit!

Start using `::component` and `:::component` syntax in your markdown files!
:::
````

:::steps

## Install dependencies

First, install the required packages:

```bash
npm install layerchart
```

## Configure

Do something else

## ???

## Profit!

Start using `::component` and `:::component` syntax in your markdown files!
:::

### Tabs

````md
:::tabs

::tab{label="JavaScript" icon="vscode-icons:file-type-js-official"}

```js
console.log('Hello from JavaScript');
```

::

::tab{label="TypeScript" icon="vscode-icons:file-type-typescript-official"}

```ts
const message: string = 'Hello from TypeScript';
console.log(message);
```

::

::tab{label="Python" icon="vscode-icons:file-type-python"}

```python
print('Hello from Python')
```

::

:::
````

:::tabs

::tab{label="JavaScript" icon="vscode-icons:file-type-js-official"}

```js
console.log('Hello from JavaScript');
```

::

::tab{label="TypeScript" icon="vscode-icons:file-type-typescript-official"}

```ts
const message: string = 'Hello from TypeScript';
console.log(message);
```

::

::tab{label="Python" icon="vscode-icons:file-type-python"}

```python
print('Hello from Python')
```

::

:::

## Tabs with live code

::tabs

:::tab{label="A"}

```svelte live
<script>
	let a = 10;
</script>

{a}
```

:::

:::tab{label="B"}

```svelte live
<script>
	let b = 20;
</script>

{b}
```

:::

::

### Icons (Inline)

```md
Here's a :icon{name="lucide:code" class="text-primary"} code icon, a :icon{name="lucide:rocket" class="text-green-500"} rocket, and a :icon{name="simple-icons:github"} GitHub logo.
```

You can also use icons inline with the `:icon` directive:

Here's a :icon{name="lucide:code" class="text-primary"} code icon,a :icon{name="lucide:rocket" class="text-green-500"} rocket, and a :icon{name="simple-icons:github"} GitHub logo.

Icons support both formats: `collection:name` (like `lucide:code`) or `i-collection-name` (like `i-lucide-code`).
