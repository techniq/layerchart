import { transformerMetaHighlight } from '@shikijs/transformers';
import { shikiDiffTransformer } from '../transformers/shiki-diff.js';

/**
 * @type {import('rehype-pretty-code').Options}
 */
export const prettyCodeOptions = {
	theme: {
		light: 'github-light-default',
		dark: 'github-dark-default'
	},
	keepBackground: false,
	defaultLang: {
		block: 'plaintext'
		// inline: "plaintext",
	},
	transformers: [shikiDiffTransformer(), transformerMetaHighlight()]
};
