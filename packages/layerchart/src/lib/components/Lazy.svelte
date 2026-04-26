<script lang="ts" module>
  import type { Component, ComponentProps, Snippet } from 'svelte';

  export type LazyProps<T extends Component<any, any, any>> = {
    /**
     * Dynamic import of a Svelte component.
     * The bundler turns each `import('./X.svelte')` into a separate chunk.
     * Must be a literal `import()` expression for code-splitting to work.
     *
     * @example load={() => import('./Heavy.svelte')}
     */
    load: () => Promise<{ default: T }>;

    /**
     * Optional snippet that receives the loaded component to render. Use this
     * when you need to render the component multiple times (e.g. inside an
     * `{#each}`) or transform props in the template.
     *
     * Named `then` (rather than `children`) so it doesn't collide with the
     * loaded component's own `children` snippet when props are spread.
     *
     * If omitted, all extra props passed to `<Lazy>` are spread directly to
     * the loaded component.
     */
    then?: Snippet<[T]>;
  } & Partial<ComponentProps<T>>;
</script>

<script lang="ts" generics="T extends Component<any, any, any>">
  let { load, then: thenSnippet, ...rest }: LazyProps<T> = $props();

  let LoadedComponent = $state<T | null>(null);

  $effect(() => {
    if (!LoadedComponent) {
      load().then((m) => {
        LoadedComponent = m.default;
      });
    }
  });
</script>

{#if LoadedComponent}
  {#if thenSnippet}
    {@render thenSnippet(LoadedComponent)}
  {:else}
    <LoadedComponent {...rest} />
  {/if}
{/if}
