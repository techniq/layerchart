import { error } from '@sveltejs/kit';
import { allComponents } from 'content-collections';

export const load = async ({ params }) => {
	const component = allComponents.find((component) => component.id == params.id);

	if (!component) {
		error(404, 'Component not found');
	}

	return {
		component
	};
};
