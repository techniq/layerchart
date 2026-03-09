import { query, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { api, graphql } from './api';

type Person = {
	username: string;
	avatar: string;
	link?: string;
	contributions?: number;
	monthlyAmount?: number;
};
type SponsorTier = { sponsor: Person[]; level: string };

const TIER_LEVELS = [
	{ level: 'Gold Level', min: 100 },
	{ level: 'Silver Level', min: 25 },
	{ level: 'Bronze Level', min: 10 },
	{ level: 'Backers Level', min: 1 }
] as const;

const SPONSOR_TIER_OVERRIDES: Record<string, string> = {
	tenzir: 'Silver Level',
	jycouet: 'Bronze Level',
	huntabyte: 'Bronze Level'
};

export const getContribSponsors = query(async () => {
	const { fetch } = getRequestEvent();

	const githubHeaders: Record<string, string> = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'LayerChart docs'
	};
	if (env.GITHUB_API_TOKEN) {
		const prefix = env.GITHUB_API_TOKEN.startsWith('ghp_') ? 'token' : 'Bearer';
		githubHeaders['Authorization'] = `${prefix} ${env.GITHUB_API_TOKEN}`;
	}

	const [contributors, sponsors] = await Promise.all([
		fetchContributors(fetch, githubHeaders),
		fetchSponsors(fetch, githubHeaders)
	]);

	return { contributors, sponsors };
});

async function fetchContributors(
	fetch: typeof globalThis.fetch,
	headers: Record<string, string>
): Promise<Person[]> {
	const contributors: Person[] = [];
	let page = 1;

	while (true) {
		const data = await api<any[]>(
			'https://api.github.com',
			'repos/techniq/layerchart/contributors',
			{ fetch, headers, data: { per_page: '100', page: String(page) } }
		);

		if (!data || data.length === 0) break;

		for (const c of data) {
			if (c.type === 'User') {
				contributors.push({
					username: c.login,
					avatar: c.avatar_url,
					link: c.html_url,
					contributions: c.contributions
				});
			}
		}

		if (data.length < 100) break;
		page++;
	}

	return contributors;
}

async function fetchSponsors(
	fetch: typeof globalThis.fetch,
	headers: Record<string, string>
): Promise<SponsorTier[]> {
	if (!env.GITHUB_API_TOKEN) {
		console.warn('No GITHUB_API_TOKEN set, skipping sponsors fetch');
		return [];
	}

	type SponsorshipNode = {
		sponsorEntity: { login: string; avatarUrl: string; url: string } | null;
		tier: { name: string; monthlyPriceInDollars: number } | null;
		isActive: boolean;
	};
	type FlatSponsorNode = { login: string; avatarUrl: string; url: string } | null;

	const data = await graphql<{
		user: {
			sponsorshipsAsMaintainer?: { nodes: SponsorshipNode[] };
			sponsors: { nodes: FlatSponsorNode[] };
		};
	}>(
		'https://api.github.com/graphql',
		`
			query {
				user(login: "techniq") {
					sponsorshipsAsMaintainer(first: 100, activeOnly: false) {
						nodes {
							sponsorEntity {
								... on User {
									login
									avatarUrl
									url
								}
								... on Organization {
									login
									avatarUrl
									url
								}
							}
							tier {
								name
								monthlyPriceInDollars
							}
							isActive
						}
					}
					sponsors(first: 100) {
						nodes {
							... on User {
								login
								avatarUrl
								url
							}
							... on Organization {
								login
								avatarUrl
								url
							}
						}
					}
				}
			}
		`,
		{},
		{ fetch, headers }
	);

	if (!data?.user) {
		console.warn('Sponsors query returned no user data');
		return [];
	}

	const tieredNodes = data.user.sponsorshipsAsMaintainer?.nodes;
	if (tieredNodes && tieredNodes.length > 0) {
		console.log(
			'Raw sponsors:',
			tieredNodes.map((n) => ({
				login: n.sponsorEntity?.login,
				tier: n.tier?.name,
				price: n.tier?.monthlyPriceInDollars,
				active: n.isActive
			}))
		);

		const tierMap = new Map<string, Person[]>();
		for (const level of [...TIER_LEVELS.map((t) => t.level), 'Past Sponsors']) {
			tierMap.set(level, []);
		}

		for (const node of tieredNodes) {
			if (!node.sponsorEntity) continue;

			const login = node.sponsorEntity.login;
			const price = node.tier?.monthlyPriceInDollars ?? 0;

			const person: Person = {
				username: login,
				avatar: node.sponsorEntity.avatarUrl,
				link: node.sponsorEntity.url,
				monthlyAmount: price || undefined
			};

			if (!node.isActive) {
				tierMap.get('Past Sponsors')!.push(person);
				continue;
			}

			const override = SPONSOR_TIER_OVERRIDES[login];
			const level = override ?? TIER_LEVELS.find((t) => price >= t.min)?.level ?? 'Backers Level';
			tierMap.get(level)!.push(person);
		}

		return [...tierMap.entries()]
			.filter(([, sponsors]) => sponsors.length > 0)
			.map(([level, sponsor]) => ({ level, sponsor }));
	}

	const flatNodes = data.user.sponsors?.nodes;
	if (!flatNodes || flatNodes.length === 0) return [];

	const sponsors: Person[] = flatNodes
		.filter((n): n is NonNullable<FlatSponsorNode> => n != null && n.login != null)
		.map((n) => ({ username: n.login, avatar: n.avatarUrl, link: n.url }));

	if (sponsors.length === 0) return [];
	return [{ level: 'Backers Level', sponsor: sponsors }];
}
