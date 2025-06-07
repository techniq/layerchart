import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['https://d3og.com/armollica/06a202c9f7df191ace8a1f97e33ffb97/'],
    },
  };
}
