/**
 * LayerChart GitHub Releases Fetcher
 *
 * This script fetches all releases from the GitHub repository and writes
 * them as individual markdown files for the docs site.
 *
 * @description
 * - Fetches all releases from https://github.com/techniq/layerchart/releases
 * - Writes each release as a markdown file in docs/src/content/releases/
 * - Preserves release metadata in frontmatter
 *
 * @usage
 * layerstack-docs generate-releases techniq/layerchart generated/releases
 *
 * @example
 * // Generates files like:
 * // docs/src/content/releases/v0.1.0.md
 * // docs/src/content/releases/v0.2.0.md
 */

import fs from 'fs';
import path from 'path';
interface GitHubRelease {
	id: number;
	tag_name: string;
	name: string;
	body: string;
	html_url: string;
	created_at: string;
	published_at: string;
	draft: boolean;
	prerelease: boolean;
	author: {
		login: string;
		html_url: string;
	};
}

/**
 * Fetch all releases from GitHub API
 */
async function fetchReleases(githubApi: string): Promise<GitHubRelease[]> {
	const releases: GitHubRelease[] = [];
	let page = 1;
	const perPage = 100;

	while (true) {
		const url = `${githubApi}?per_page=${perPage}&page=${page}`;
		console.log(`Fetching page ${page}...`);

		const token = process.env.GITHUB_API_TOKEN || process.env.GITHUB_TOKEN;
		let response = await fetch(url, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined
		});

		// Retry unauthenticated if the provided token is rejected (e.g. stale local env var)
		if (response.status === 401 && token) {
			console.warn('GitHub returned 401 with provided token — retrying unauthenticated');
			response = await fetch(url);
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch releases: ${response.status} ${response.statusText}`);
		}

		const pageReleases: GitHubRelease[] = await response.json();

		if (pageReleases.length === 0) {
			break;
		}

		releases.push(...pageReleases);

		// If we got fewer releases than perPage, we're on the last page
		if (pageReleases.length < perPage) {
			break;
		}

		page++;
	}

	return releases;
}

/**
 * Convert a release to markdown format with frontmatter
 */
function releaseToMarkdown(release: GitHubRelease): string {
	const frontmatter = [
		'---',
		`title: "${release.name || release.tag_name}"`,
		`tag: "${release.tag_name}"`,
		`date: "${release.published_at}"`,
		`url: "${release.html_url}"`,
		`draft: ${release.draft}`,
		`prerelease: ${release.prerelease}`,
		`author: "${release.author.login}"`,
		'---',
		''
	].join('\n');

	return frontmatter + (release.body || '');
}

/**
 * Get filename for a release
 */
function getReleaseFilename(release: GitHubRelease): string {
	// Use tag_name as filename (e.g., v0.1.0.md)
	// Sanitize the tag name to be filesystem-safe
	const sanitized = release.tag_name.replace(/[^a-zA-Z0-9.-]/g, '-');
	return `${sanitized}.md`;
}

/**
 * Main execution
 */
export interface GenerateReleasesOptions {
	repo: string;
	outputDir: string;
}

export async function generateReleases({ repo, outputDir }: GenerateReleasesOptions) {
	console.log('Fetching releases from GitHub...');

	// Fetch all releases
	const releases = await fetchReleases(`https://api.github.com/repos/${repo}/releases`);
	console.log(`Found ${releases.length} releases`);

	// Filter out drafts (optional - you can remove this if you want drafts too)
	const publishedReleases = releases.filter((r) => !r.draft);
	console.log(`Processing ${publishedReleases.length} published releases`);

	// Ensure releases directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
		console.log(`Created directory: ${outputDir}`);
	}

	// Write each release to a file (skip if already exists to preserve local edits)
	let newCount = 0;
	let skippedCount = 0;

	for (const release of publishedReleases) {
		const filename = getReleaseFilename(release);
		const filepath = path.join(outputDir, filename);

		// Skip if file already exists (preserves local edits)
		if (fs.existsSync(filepath)) {
			console.log(`⊝ Skipped ${filename} (already exists)`);
			skippedCount++;
			continue;
		}

		const markdown = releaseToMarkdown(release);
		fs.writeFileSync(filepath, markdown, 'utf-8');
		console.log(`✓ Wrote ${filename}`);
		newCount++;
	}

	console.log(
		`\nSuccessfully wrote ${newCount} new release file${newCount === 1 ? '' : 's'} to ${outputDir}`
	);
	if (skippedCount > 0) {
		console.log(`Skipped ${skippedCount} existing file${skippedCount === 1 ? '' : 's'}`);
	}
}
