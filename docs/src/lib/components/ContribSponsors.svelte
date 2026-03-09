<script lang="ts">
	import AvatarBubble from './AvatarBubble.svelte';
	import AvatarFan from './AvatarFan.svelte';

	import { getContribSponsors } from '$lib/contribspons.remote';
	const { contributors, sponsors } = await getContribSponsors();
</script>

<div class="rounded-xl outline m-4 outline-surface-content/10 gap-2 h-34">
	<div class="text-center pt-4 text-xl font-bold text-surface-content">
		Thank you to our <a
			href="https://github.com/techniq/layerchart/graphs/contributors"
			target="_blank"
			class="hover:underline">Contributors</a
		> <span class="text-surface-content/50 text-xs">({contributors.length})</span>
	</div>
	<AvatarFan people={contributors} />
</div>
<div
	class="flex flex-col items-center rounded-xl outline m-4 px-8 outline-surface-content/10 gap-2"
>
	<div class="text-center pt-4 text-xl font-bold text-surface-content">
		Special thanks to our <a
			href="https://github.com/sponsors/techniq"
			target="_blank"
			class="hover:underline">Sponsors</a
		>
		<span class="text-surface-content/50 text-sm"
			>({sponsors.reduce((acc, s) => acc + s.sponsor.length, 0)})</span
		>
		<div class="flex flex-col gap-4 items-center justify-center">
			<AvatarBubble people={sponsors} />
		</div>
	</div>
</div>
