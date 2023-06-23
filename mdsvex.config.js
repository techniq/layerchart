import slug from 'rehype-slug';

export default {
  extensions: ['.md', '.svx'],
  layout: './src/lib/docs/Layout.svelte',
  rehypePlugins: [slug]
  // highlight: false
};
