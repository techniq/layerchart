import { getComponentDoc } from '$lib/markdown/utils.js';

export const load = async ({ params }) => {
	return getComponentDoc(params.slug);
};
