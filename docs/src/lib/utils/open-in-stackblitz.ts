import sdk from '@stackblitz/sdk';

export async function openInStackBlitz(component: string, name: string) {
	try {
		const res = await fetch(`/api/example.json?component=${component}&name=${name}`);
		if (!res.ok) {
			console.error('Failed to fetch example code from server.');
			return;
		}

		const { code: exampleCode, files } = (await res.json()) as {
			code: string;
			files: Record<string, string>;
		};

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
