import { on } from 'svelte/events';

/** Hides a sticky bar on scroll down, reveals on scroll up. */
export function hideybar({ offsetTop = '0px', mx = '0px', threshold = 0 } = {}) {
	return (node: HTMLElement) => {
		const parent = node.parentElement;
		if (!parent) return;

		const spacer = document.createElement('div');
		node.insertAdjacentElement('afterend', spacer);

		node.style.position = 'fixed';
		node.style.top = offsetTop;
		node.style.transform = 'translateY(0)';
		node.style.transition = 'transform 200ms ease-in-out';
		node.style.overflow = 'hidden';

		const syncSize = () => {
			const parentRect = parent.getBoundingClientRect();
			node.style.left = `calc(${parentRect.left}px + ${mx})`;
			node.style.width = `calc(${parentRect.width}px - ${mx} * 2)`;
			const h = node.getBoundingClientRect().height;
			if (h > 0) spacer.style.height = `${h}px`;
		};
		syncSize();

		const ro = new ResizeObserver(syncSize);
		ro.observe(parent);
		ro.observe(node);

		let lastScrollY = window.scrollY;
		let isHidden = false;
		const cleanupScroll = on(
			window,
			'scroll',
			() => {
				const currentScrollY = window.scrollY;
				const goingUp = currentScrollY < lastScrollY;
				const shouldHide = !goingUp && currentScrollY > threshold;
				if (shouldHide !== isHidden) {
					node.style.transform = shouldHide
						? `translateY(calc(-100% - ${offsetTop}))`
						: 'translateY(0)';
					isHidden = shouldHide;
				}
				lastScrollY = currentScrollY;
			},
			{ passive: true }
		);

		return () => {
			cleanupScroll();
			ro.disconnect();
			spacer.remove();
		};
	};
}
