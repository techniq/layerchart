import { getComponentDoc } from '$lib/utils.js';

export const load = async ({ params }) => {
	return getComponentDoc(params.slug);
};
