import { allComponents } from 'content-collections';

export const load = async () => {
	const components = allComponents;

	return {
		components
	};
};
