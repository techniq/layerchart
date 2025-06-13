import pageSource from './+page.svelte?raw';
import { read } from 'shapefile';

export async function load({ url }) {
  const file = url.searchParams.get('file');
  return {
    file,
    geojson: file ? await read(file) : null,
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      hideTableOfContents: true,
    },
  };
}
