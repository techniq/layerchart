import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      hideTableOfContents: true,
    },
  };
}
