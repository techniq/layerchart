import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      supportedContexts: ['svg'], // dependency on ClipPath getting canvas support
      related: ['components/Threshold', 'components/AreaChart'],
    },
  };
}
