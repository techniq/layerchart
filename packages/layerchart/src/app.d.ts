// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Error {}
  // interface Locals {}

  interface PageData {
    meta: {
      title?: string;
      description?: string;
      source?: string;
      pageSource?: string;
      api?: SveldJson;
      features?: string[];
      related?: string[];
      hideUsage?: boolean;
      hideTableOfContents?: boolean;
      status?: string;
    };
  }

  // interface PageState {}
  // interface Platform {}
}

// TODO: Can this be referenced from `@layerstack/svelte-actions` types.d.ts without breaking other things?
// https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md
declare namespace svelteHTML {
  interface LayerStackActionEvents {
    // use:intersection
    'on:intersecting'?: (event: CustomEvent<IntersectionObserverEntry>) => void;

    // use:mutate
    'on:mutate'?: (event: CustomEvent<MutationRecord[]>) => void;

    // use:movable
    'on:movestart'?: (event: CustomEvent<{ x: number; y: number }>) => void;
    'on:move'?: (event: CustomEvent<{ x: number; y: number; dx: number; dy: number }>) => void;
    'on:moveend'?: (event: CustomEvent<{ x: number; y: number }>) => void;

    // use:popover
    'on:clickOutside'?: (event: CustomEvent) => void;

    // use:overflow
    'on:overflow'?: (event: CustomEvent<{ overflowX: number; overflowY: number }>) => void;

    // use:longpress
    'on:longpress'?: (event: CustomEvent) => void;
  }

  interface HTMLAttributes<T> extends LayerStackActionEvents {}
  interface SVGAttributes<T> extends LayerStackActionEvents {}
}
