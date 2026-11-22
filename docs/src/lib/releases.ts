import type { Release } from 'content-collections';

/** `layerchart@2.3.0` → `layerchart 2.3.0`, and a scoped package's (ex. `@layerchart/webgl@0.1.0`) likewise */
export function releaseName(release: Release) {
	const [pkg, version] = release.tag.split(/@(?=[^@]+$)/);
	return version ? `${pkg} ${version}` : release.title;
}

/** `August 20, 2026` */
export function releaseDate(release: Release) {
	return new Date(release.date).toLocaleDateString('en-US', {
		dateStyle: 'long',
		timeZone: 'UTC'
	});
}

/**
 * What a release changed, counted from its notes' changeset sections (ex. `5 minor and 12 patch
 * changes`), or `null` for notes without them
 */
export function releaseChanges(release: Release) {
	const counts: string[] = [];
	let total = 0;
	// Each section is a changeset heading and the list after it, whose top level items are the
	// changes.  A change may have headings and lists of its own, so the section ends where its list
	// closes rather than at the next heading.
	for (const section of release.html.matchAll(/<h3>(Major|Minor|Patch) Changes<\/h3>\s*<ul>/g)) {
		let depth = 1;
		let count = 0;
		const rest = release.html.slice(section.index + section[0].length);
		for (const [tag] of rest.matchAll(/<\/?ul>|<li>/g)) {
			if (tag === '<ul>') depth++;
			else if (tag === '</ul>' && --depth === 0) break;
			else if (tag === '<li>' && depth === 1) count++;
		}
		if (count) counts.push(`${count} ${section[1].toLowerCase()}`);
		total += count;
	}
	if (!counts.length) return null;
	const list =
		counts.length > 1 ? `${counts.slice(0, -1).join(', ')} and ${counts.at(-1)}` : counts[0];
	return `${list} ${total === 1 ? 'change' : 'changes'}`;
}
