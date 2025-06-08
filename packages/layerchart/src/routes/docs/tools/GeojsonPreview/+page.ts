import pageSource from './+page.svelte?raw';

export async function load({ url }) {
  return {
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      hideTableOfContents: true,
    },
  };
}
