import { error } from '@sveltejs/kit';
import { getRequestEvent, query } from '$app/server';
import { z } from 'zod';

// Sports data from ESPN's public (undocumented) APIs

// The core API (`sports.core.api.espn.com`) is avoided as it blocks requests from Cloudflare
const SITE_API = 'https://site.api.espn.com/apis/site/v2/sports';

/** Number of past seasons offered in the season picker */
const SEASON_COUNT = 15;

/** Sports with an AP Top 25 poll */
const leagues = {
	'college-football': { sport: 'football', league: 'college-football' },
	'mens-college-basketball': { sport: 'basketball', league: 'mens-college-basketball' },
	'womens-college-basketball': { sport: 'basketball', league: 'womens-college-basketball' }
} as const;

type Sport = keyof typeof leagues;

const sportSchema = z.enum(Object.keys(leagues) as [Sport, ...Sport[]]);

const siteUrl = (sport: Sport) => `${SITE_API}/${leagues[sport].sport}/${leagues[sport].league}`;

export type SportsTeam = {
	id: string;
	name: string;
	abbreviation: string;
	logo: string;
	/** Variant for dark backgrounds */
	logoDark: string;
};

export type GameResult = 'W' | 'L' | 'T';

// --- Weekly poll rankings ---

export type SportsRank = {
	week: string;
	teamId: string;
	/** Unique position within the week (1-based), used for plotting */
	position: number;
	/** Published rank, which can be shared by multiple teams */
	rank: number;
	tied: boolean;
	record?: string;
};

export type SportsWeek = {
	label: string;
	/** When the poll was released (missing for older seasons) */
	date?: string;
};

export type SportsRankings = {
	season: number;
	seasons: number[];
	weeks: SportsWeek[];
	maxRank: number;
	teams: SportsTeam[];
	ranks: SportsRank[];
};

/**
 * Weekly AP Top 25 poll rankings for a season.
 */
export const getSportsRankings = query(
	z.object({
		sport: sportSchema,
		season: z.number().int().optional()
	}),
	async ({ sport, season }): Promise<SportsRankings> => {
		// Rankings include the season's weeks (latest season when not specified)
		const latestRequest = fetchJson(`${siteUrl(sport)}/rankings`);
		const [latest, seasonResponse] = await Promise.all([
			latestRequest,
			season == null ? latestRequest : fetchJson(`${siteUrl(sport)}/rankings?seasons=${season}`)
		]);
		const latestSeason: number = latest.latestSeason.year;
		season ??= latestSeason;

		// Each week is fetched individually for the AP poll (id: 1)
		const polls = (
			await Promise.all(
				(seasonResponse.weeks as { type: string; week: string }[]).map(async ({ type, week }) => {
					const response = await fetchJson(
						`${siteUrl(sport)}/rankings?seasons=${season}&seasontypes=${type}&weeks=${week}`
					);
					const poll = (response.rankings as any[]).find((r) => r.id === '1');
					return poll && { ...poll, postseason: type === '3' };
				})
			)
		).filter(Boolean);

		// Some polls were later overwritten with another poll's rankings and date (ex. the 2025-26
		// basketball "Week 2" poll holds the final rankings), so skip any dated after a later poll
		const validPolls = polls.filter(
			(poll, i) => !polls.slice(i + 1).some((next) => next.date < poll.date)
		);

		const weeks: SportsWeek[] = [];
		const ranks: SportsRank[] = [];
		const teamsById = new Map<string, SportsTeam>();
		for (const poll of validPolls) {
			const label = pollLabel(poll);
			if (weeks.some((w) => w.label === label)) continue;
			weeks.push({ label, date: poll.date });

			for (const [i, r] of (poll.ranks as any[]).entries()) {
				if (!teamsById.has(r.team.id)) teamsById.set(r.team.id, toTeam(r.team));
				ranks.push({
					week: label,
					teamId: r.team.id,
					position: i + 1,
					rank: r.current,
					tied: poll.ranks.some((other: any) => other !== r && other.current === r.current),
					record: r.recordSummary
				});
			}
		}

		return {
			season,
			seasons: seasonRange(latestSeason),
			weeks,
			maxRank: Math.max(25, ...ranks.map((r) => r.position)),
			teams: [...teamsById.values()],
			ranks
		};
	}
);

// --- A team's games ---

export type TeamGame = {
	id: string;
	date: string;
	home: boolean;
	neutralSite: boolean;
	opponent: SportsTeam;
	/** Opponent's rank at the time of the game */
	opponentRank?: number;
	/** Opponent's tournament seed (basketball postseason) */
	opponentSeed?: number;
	score?: number;
	opponentScore?: number;
	/** Set once the game is final */
	result?: GameResult;
	/** Status summary (ex. `Final`, `10/24 - 12:00 PM EDT`) */
	status: string;
};

/**
 * A team's games for a season (regular season and postseason), fetched on demand since a full
 * season of scoreboards for every ranked team is far larger than needed.
 */
export const getTeamGames = query(
	z.object({
		sport: sportSchema,
		season: z.number().int(),
		teamId: z.string().regex(/^\d+$/)
	}),
	async ({ sport, season, teamId }): Promise<TeamGame[]> => {
		const url = `${siteUrl(sport)}/teams/${teamId}/schedule?season=${season}`;
		// Postseason is a separate request for football (basketball includes it in both)
		const schedules = await Promise.all([fetchJson(url), fetchJson(`${url}&seasontype=3`)]);
		const events = new Map<string, any>(
			schedules.flatMap((schedule) => schedule.events).map((e: any) => [e.id, e])
		);

		return [...events.values()]
			.sort((a, b) => a.date.localeCompare(b.date))
			.map((event) => {
				const competition = event.competitions[0];
				const competitors: any[] = competition.competitors;
				const team = competitors.find((c) => c.team.id === teamId);
				const opponent = competitors.find((c) => c.team.id !== teamId);
				const completed = competition.status.type.completed;
				// Basketball tournament games list seeds instead of ranks
				const isTournament = leagues[sport].sport === 'basketball' && event.seasonType?.type === 3;

				return {
					id: event.id,
					date: event.date,
					home: team.homeAway === 'home',
					neutralSite: competition.neutralSite,
					opponent: toTeam(opponent.team),
					opponentRank: isTournament ? undefined : topRank(opponent),
					opponentSeed: isTournament ? opponent.curatedRank?.current : undefined,
					score: completed ? team.score?.value : undefined,
					opponentScore: completed ? opponent.score?.value : undefined,
					result: completed ? gameResult(team, opponent) : undefined,
					status: competition.status.type.shortDetail
				};
			});
	}
);

// --- Ranked matchups (college football) ---

export type MatchupTeam = SportsTeam & {
	/** Rank at kickoff (AP poll, or CFP rankings once released) */
	rank?: number;
	score?: number;
	/** Set once the game is final */
	result?: GameResult;
};

export type Matchup = {
	id: string;
	week: string;
	date: string;
	/** Status summary (ex. `Final`, `10/24 - 12:00 PM EDT`) */
	status: string;
	teams: [MatchupTeam, MatchupTeam];
};

export type SeasonMatchups = {
	season: number;
	seasons: number[];
	weeks: string[];
	games: Matchup[];
};

const POSTSEASON_ROUNDS = ['Bowls', 'R1', 'QF', 'SF', 'Title'];

/**
 * College football games involving a ranked team, for each week of a season (through the current
 * week).  Postseason games are split into bowls and each playoff round.
 */
export const getRankedMatchups = query(
	z.object({ season: z.number().int().optional() }),
	async ({ season }): Promise<SeasonMatchups> => {
		const url = `${siteUrl('college-football')}/scoreboard`;
		// Only waited on first when loading the latest season
		const latestSeasonRequest = fetchJson(`${url}?limit=1`).then((d): number => d.season.year);
		season ??= await latestSeasonRequest;
		const scoreboardUrl = (seasonType: number, week: string | number) =>
			`${url}?dates=${season}&seasontype=${seasonType}&week=${week}`;

		// Week 1 includes the season calendar, used to find the remaining (started) weeks
		const [latestSeason, firstWeek] = await Promise.all([
			latestSeasonRequest,
			fetchJson(scoreboardUrl(2, 1))
		]);
		const calendar: any[] = firstWeek.leagues[0].calendar;
		const started = (entry: any) => new Date(entry.startDate) <= new Date();
		const regularWeeks: string[] = calendar
			.find((c) => c.value === '2')
			.entries.filter(started)
			.map((entry: any) => entry.value);
		const postseasonStarted = calendar.find((c) => c.value === '3')?.entries.some(started);

		const requests = regularWeeks.slice(1).map((week) => fetchJson(scoreboardUrl(2, week)));
		if (postseasonStarted) {
			// All postseason games (bowls and playoff) are in the first postseason "week"
			requests.push(fetchJson(scoreboardUrl(3, 1)));
		}
		const scoreboards = [firstWeek, ...(await Promise.all(requests))];

		const games: Matchup[] = [];
		for (const event of scoreboards.flatMap((scoreboard) => scoreboard.events as any[])) {
			const competition = event.competitions[0];
			const headline: string = competition.notes?.[0]?.headline ?? '';
			if (headline.startsWith('FCS')) continue;

			const [a, b] = competition.competitors as any[];
			const completed = competition.status.type.completed;
			const toMatchupTeam = (c: any, opponent: any): MatchupTeam => ({
				...toTeam(c.team),
				rank: topRank(c),
				score: c.score != null ? Number(c.score) : undefined,
				result: completed ? gameResult(c, opponent) : undefined
			});
			const teams: [MatchupTeam, MatchupTeam] = [toMatchupTeam(a, b), toMatchupTeam(b, a)];
			if (!teams.some((t) => t.rank)) continue;

			games.push({
				id: event.id,
				week: event.season.type === 3 ? postseasonRound(headline) : String(event.week.number),
				date: event.date,
				status: competition.status.type.shortDetail,
				teams
			});
		}

		const weeks = [...regularWeeks, ...POSTSEASON_ROUNDS].filter((week) =>
			games.some((g) => g.week === week)
		);

		return { season, seasons: seasonRange(latestSeason), weeks, games };
	}
);

// --- Helpers ---

async function fetchJson(url: string, retries = 1): Promise<any> {
	const { fetch } = getRequestEvent();
	const response = await fetch(url).catch(() => null);
	// Retry dropped connections and server errors, which ESPN returns occasionally
	if ((!response || response.status >= 500) && retries > 0) {
		return fetchJson(url, retries - 1);
	}
	if (!response?.ok) {
		error(502, `Unable to load ${url} (${response?.status ?? 'network error'})`);
	}
	return response.json();
}

function toTeam(team: any): SportsTeam {
	// Team endpoints have a list of `logos`, while scoreboards have `logo` / `logoDark`
	const logos: { href: string; rel: string[] }[] = team.logos ?? [];
	const logo: string =
		logos.find((l) => l.rel.includes('default'))?.href ?? logos[0]?.href ?? team.logo ?? '';
	const logoDark: string = logos.find((l) => l.rel.includes('dark'))?.href ?? team.logoDark ?? logo;
	return {
		id: team.id,
		// Rankings list `location` and `name` (ex. `Miami` `Hurricanes`) without `displayName`
		name: team.displayName ?? `${team.location} ${team.name}`,
		abbreviation: team.abbreviation,
		logo: resizeLogo(logo),
		logoDark: resizeLogo(logoDark)
	};
}

/** Request a small, resized logo (originals are 500px) */
function resizeLogo(href: string) {
	return href.startsWith('https://a.espncdn.com/')
		? `https://a.espncdn.com/combiner/i?img=${new URL(href).pathname}&w=64&h=64`
		: href;
}

/** A competitor's Top 25 rank at the time of the game (unranked teams are `99`) */
function topRank(competitor: any): number | undefined {
	const rank = competitor.curatedRank?.current;
	return rank && rank <= 25 ? rank : undefined;
}

function gameResult(competitor: any, opponent: any): GameResult {
	return competitor.winner ? 'W' : opponent.winner ? 'L' : 'T';
}

function postseasonRound(headline: string) {
	if (/national championship/i.test(headline)) return 'Title';
	if (/semifinal/i.test(headline)) return 'SF';
	if (/quarterfinal/i.test(headline)) return 'QF';
	if (/first round/i.test(headline)) return 'R1';
	return 'Bowls';
}

function pollLabel(poll: any) {
	// Postseason polls are numbered (ex. `Week 3`) for basketball rather than `Final Rankings`
	if (poll.postseason) return 'Final';
	const displayValue: string = poll.occurrence.displayValue;
	// `occurrence.number` is off by one for basketball, so use the label
	return displayValue.startsWith('Pre') ? 'Pre' : displayValue.replace('Week ', '');
}

/** Oldest to latest, so a stepper's "next" moves forward in time */
function seasonRange(latest: number) {
	return Array.from({ length: SEASON_COUNT }, (_, i) => latest - SEASON_COUNT + 1 + i);
}
