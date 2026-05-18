import { onNavigate } from '$app/navigation';

export const preparePageTransition = () => {
	onNavigate((navigation) => {
		if (!document.startViewTransition) {
			return;
		}

		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
};
