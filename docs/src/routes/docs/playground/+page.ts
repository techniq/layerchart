export const load = async ({ data }) => {
	return {
		...data,
		meta: {
			fullWidth: true
		}
	};
};
