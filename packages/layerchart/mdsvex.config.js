import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import slug from 'rehype-slug';

export default {
  extensions: ['.md', '.svx'],
  // https://github.com/pngwn/MDsveX/issues/556
  layout: dirname(fileURLToPath(import.meta.url)) + '/src/lib/docs/Layout.svelte',
  rehypePlugins: [slug],
  // highlight: false
};
