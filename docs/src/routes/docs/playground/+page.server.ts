/** @type {import('@sveltejs/kit').Load} */
export const load = ({ setHeaders }) => {
	setHeaders({
		'Cross-Origin-Embedder-Policy': 'require-corp',
		'Cross-Origin-Opener-Policy': 'same-origin'
	});
};
