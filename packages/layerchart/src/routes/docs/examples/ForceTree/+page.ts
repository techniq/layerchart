import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
    },
  };
}
