import sdk from '@stackblitz/sdk';
import { getExample } from '$lib/stackblitz.remote';

export async function openInStackBlitz(component: string, name: string) {
	try {
		const { code: exampleCode, files } = await getExample({ component, name });

		sdk.openProject(
			{
				title: `${name} - LayerChart`,
				files: {
					...files,
					'src/routes/+page.svelte': exampleCode
				},
				template: 'node'
			},
			{
				newWindow: true,
				openFile: 'src/routes/+page.svelte',
				terminalHeight: 10
			}
		);
	} catch (err) {
		console.error('Failed to open in StackBlitz:', err);
	}
}
