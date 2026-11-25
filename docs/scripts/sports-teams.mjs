/**
 * Builds `static/data/examples/geo/sports-teams.csv` for the `Image/sports-territories` example:
 * every MLB, NFL, NBA, NHL and WNBA team, every Division I (FBS and FCS), II and III college football
 * team, and every Division I men's and women's college basketball team (ESPN has no others), from:
 *
 * - ESPN's public (undocumented) APIs: conferences (and divisions), venues, brand colors and logos
 *   (and, for the many Division II and III teams it has no colors for, colors taken from their logos)
 * - NCES IPEDS (public domain): each college's campus location
 * - Wikidata (CC0): each pro team's venue location
 *
 *   node scripts/sports-teams.mjs
 *
 * Reports teams that couldn't be located or whose sources disagree, to add to the tables below.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { ascending, greatest, group, index, rollup, sort } from 'd3-array';
import { csvFormat, csvParse } from 'd3-dsv';

const OUT_FILE = 'static/data/examples/geo/sports-teams.csv';

const SITE_API = 'https://site.api.espn.com/apis/v2/sports';
const SITE_TEAMS_API = 'https://site.api.espn.com/apis/site/v2/sports';
const CORE_API = 'https://sports.core.api.espn.com/v2/sports';
// Directory information (name, location, ...) of every US college
const IPEDS_URL = 'https://nces.ed.gov/ipeds/datacenter/data/HD2024.zip';
const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'layerchart-docs-data (https://github.com/techniq/layerchart)';

// prettier-ignore
const leagues = [
	{ league: 'mlb', sport: 'baseball', espnLeague: 'mlb', standings: 'level=3', divisions: true, wikidata: 'Q1163715' },
	{ league: 'nfl', sport: 'football', espnLeague: 'nfl', standings: 'level=3', divisions: true, wikidata: 'Q1215884' },
	{ league: 'nba', sport: 'basketball', espnLeague: 'nba', standings: 'level=3', divisions: true, wikidata: 'Q155223' },
	{ league: 'nhl', sport: 'hockey', espnLeague: 'nhl', standings: 'level=3', divisions: true, wikidata: 'Q1215892' },
	{ league: 'wnba', sport: 'basketball', espnLeague: 'wnba', wikidata: 'Q2593221' },
	// Division I's two subdivisions
	{ league: 'cfb', sport: 'football', espnLeague: 'college-football', subdivisions: { FBS: 'group=80', FCS: 'group=81' }, college: true },
	// Divisions II and III (by ESPN's group, as their standings aren't published)
	{ league: 'cfb2', sport: 'football', espnLeague: 'college-football', group: 57, college: true },
	{ league: 'cfb3', sport: 'football', espnLeague: 'college-football', group: 58, college: true },
	{ league: 'cbb', sport: 'basketball', espnLeague: 'mens-college-basketball', college: true },
	{ league: 'wcbb', sport: 'basketball', espnLeague: 'womens-college-basketball', college: true }
];

/** Logo folder in ESPN's `/i/teamlogos/<folder>/500/<key>.png` (`ncaa` for colleges) */
const LOGO_FOLDERS = { mlb: 'mlb', nfl: 'nfl', nba: 'nba', nhl: 'nhl', wnba: 'wnba' };

const venue = (fullName, city, state, wikidata) => ({
	fullName,
	address: { city, state },
	wikidata
});

/**
 * Venues to use instead of ESPN's (which lists a former one for some teams), with their Wikidata
 * item when Wikidata's home venue for the team is out of date
 */
const VENUE_FIXES = {
	mlb: {
		Athletics: venue('Sutter Health Park', 'West Sacramento', 'CA', 'Q3418115'),
		'Texas Rangers': venue('Globe Life Field', 'Arlington', 'TX', 'Q24284037')
	},
	nfl: {
		'Buffalo Bills': venue('Highmark Stadium', 'Orchard Park', 'NY'),
		'Jacksonville Jaguars': venue('EverBank Stadium', 'Jacksonville', 'FL'),
		'Los Angeles Chargers': venue('SoFi Stadium', 'Inglewood', 'CA'),
		'Los Angeles Rams': venue('SoFi Stadium', 'Inglewood', 'CA')
	},
	nba: {
		'Brooklyn Nets': venue('Barclays Center', 'Brooklyn', 'NY'),
		// ESPN has no state
		'Detroit Pistons': venue('Little Caesars Arena', 'Detroit', 'MI'),
		'Golden State Warriors': venue('Chase Center', 'San Francisco', 'CA'),
		'LA Clippers': venue('Intuit Dome', 'Inglewood', 'CA', 'Q54958436'),
		'Milwaukee Bucks': venue('Fiserv Forum', 'Milwaukee', 'WI'),
		'Sacramento Kings': venue('Golden 1 Center', 'Sacramento', 'CA')
	},
	nhl: {
		'New Jersey Devils': venue('Prudential Center', 'Newark', 'NJ'),
		'Winnipeg Jets': venue('Canada Life Centre', 'Winnipeg', 'MB')
	},
	wnba: {
		'Atlanta Dream': venue('Gateway Center Arena', 'College Park', 'GA'),
		'Chicago Sky': venue('Wintrust Arena', 'Chicago', 'IL'),
		'Dallas Wings': venue('Kay Bailey Hutchison Convention Center', 'Dallas', 'TX'),
		'Las Vegas Aces': venue('Michelob Ultra Arena', 'Las Vegas', 'NV'),
		'Seattle Storm': venue('Climate Pledge Arena', 'Seattle', 'WA')
	},
	// Only for the tooltip (colleges are located by campus)
	cfb: {
		'Cal Poly Mustangs': venue('Alex G. Spanos Stadium', 'San Luis Obispo', 'CA'),
		'Illinois Fighting Illini': venue('Memorial Stadium', 'Champaign', 'IL')
	}
};

/** Wikidata's name for teams whose ESPN name differs */
const WIKIDATA_NAMES = { 'LA Clippers': 'Los Angeles Clippers' };

/**
 * IPEDS ids of colleges (by ESPN's name) that can't be told apart from another school in their
 * city, or whose ESPN venue is in another city than their campus (ex. UCLA's Rose Bowl)
 */
// prettier-ignore
const CAMPUS_IDS = {
	'Air Force': 128328, 'Alabama A&M': 100654, 'Alcorn State': 175342, Army: 197036, Binghamton: 196079,
	'Cal Poly': 110422, 'Chicago State': 144005, Denver: 127060, 'Fairleigh Dickinson': 184603,
	'Green Bay': 240277, Illinois: 145637, Jacksonville: 134945, 'Long Island University': 192448,
	Miami: 135726, 'Mississippi State': 176080, 'Notre Dame': 152080, Niagara: 193973, Oakland: 171571,
	'Ole Miss': 176017, Portland: 209825, Richmond: 233374, Rutgers: 186380, 'Saint Louis': 179159,
	Samford: 102049, 'San Diego': 122436, 'Seton Hall': 186584, Siena: 195474, Stonehill: 167996,
	UAlbany: 196060, 'UC San Diego': 110680, UCLA: 110662, UConn: 129020, Villanova: 216597,
	// Divisions II and III
	'Bethel (MN)': 173160, Bloomsburg: 498562, 'California (PA)': 498571, 'Central State': 201690,
	'Claremont Mudd Scripps': 112260, Lyon: 106342, 'New England College': 182980, Wilkes: 216931
};

const campus = (name, city, state, latitude, longitude) => ({
	name,
	city,
	state,
	latitude,
	longitude
});

/**
 * Campuses of merged universities, which IPEDS lists as one (at another campus), with their
 * locations from Wikidata (CC0)
 */
const CAMPUS_LOCATIONS = {
	Clarion: campus('Clarion University (PennWest)', 'Clarion', 'PA', 41.209, -79.378), // Q5127034
	Edinboro: campus('Edinboro University (PennWest)', 'Edinboro', 'PA', 41.87, -80.122), // Q5338120
	'Lock Haven': campus(
		'Lock Haven University (Commonwealth)',
		'Lock Haven',
		'PA',
		41.1411,
		-77.4611
	), // Q6665223
	'Vermont State Castleton': campus(
		'Castleton University (Vermont State)',
		'Castleton',
		'VT',
		43.608,
		-73.1785
	) // Q1049687
};

// prettier-ignore
const STATE_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', ON: 'Ontario', QC: 'Quebec' };
const STATE_CODES = Object.fromEntries(
	Object.entries(STATE_NAMES).map(([code, name]) => [name, code])
);

/** Venues known to be shared (others sharing a location are reported) */
const SHARED_VENUES = ['MetLife Stadium', 'SoFi Stadium'];

const problems = [];

const colleges = await loadColleges();
const proVenues = await loadProVenues();

const rows = [];
for (const config of leagues) {
	const teams = config.group ? await groupTeams(config) : [];
	const queries = config.group ? {} : (config.subdivisions ?? { '': config.standings ?? '' });
	for (const [subdivision, query] of Object.entries(queries)) {
		const url = `${SITE_API}/${config.sport}/${config.espnLeague}/standings?${query}`;
		const standings = standingsTeams(await fetchJson(url), config.divisions);
		teams.push(...standings.map((t) => ({ ...t, subdivision })));
	}
	console.log(`${config.league}: ${teams.length} teams`);
	// In a stable order (standings change from day to day), so a rerun only differs by what changed
	const leagueRows = await mapLimit(teams, 8, (team) => teamRow(config, team));
	rows.push(
		...sort(
			leagueRows,
			(d) => d.subdivision,
			(d) => d.conference,
			(d) => d.division,
			(d) => d.name
		)
	);
}

for (const [key, shared] of group(rows, (d) => `${d.league} ${d.latitude},${d.longitude}`)) {
	if (shared.length > 1 && !SHARED_VENUES.includes(shared[0].venue)) {
		problems.push(`${key}: shared by ${shared.map((d) => d.name).join(', ')}`);
	}
}

writeFileSync(OUT_FILE, csvFormat(rows) + '\n');
console.log(`Wrote ${rows.length} teams to ${OUT_FILE}`);
if (problems.length) console.warn(`\n${problems.length} problems:\n${problems.join('\n')}`);

async function teamRow(config, { id, subdivision, conference, division }) {
	const { league, sport, espnLeague, college } = config;
	const teamUrl = `${CORE_API}/${sport}/leagues/${espnLeague}/teams/${id}`;
	let team = await fetchJson(teamUrl);
	// The core API leaves out a college's venue now and then
	for (let attempt = 0; college && !team.venue && attempt < 3; attempt++) {
		await sleep(1000);
		team = await fetchJson(teamUrl);
	}
	// Pro venues are missing from the core API for some teams (but college venues are only there)
	const espnVenue = college
		? team.venue
		: ((await fetchJson(`${SITE_TEAMS_API}/${sport}/${espnLeague}/teams/${id}`)).team.franchise
				?.venue ?? team.venue);
	const venue = VENUE_FIXES[league]?.[team.displayName] ?? espnVenue;

	const row = {
		league,
		id,
		name: team.displayName,
		short_name: team.shortDisplayName,
		abbreviation: team.abbreviation,
		// College football only (FBS or FCS)
		subdivision,
		conference,
		division,
		// College's campus (pro teams are located by their venue)
		campus: '',
		venue: venue?.fullName ?? '',
		city: venue?.address?.city ?? '',
		state: stateCode(venue?.address?.state),
		latitude: '',
		longitude: '',
		color: `#${team.color ?? '000000'}`,
		alt_color: `#${team.alternateColor ?? 'ffffff'}`,
		...logoKeys(league, team)
	};

	// ESPN gives most Division II and III teams no colors (black, which is real for some Division I
	// teams), so those are taken from their logos
	if (config.group && row.color === '#000000' && row.logo_key) {
		Object.assign(row, await logoColors(row.logo_key));
	}
	// A logo made to sit on the team's color that doesn't stand out from it (ex. the Pirates' black
	// logo, made for their gold, on the black ESPN lists), for the dark one instead
	if (row.logo_guid && !(await standsOut(row.logo_guid, row.color))) {
		console.log(
			`${league} ${row.name}: logo on its color is hidden (${row.color}), using the dark one`
		);
		row.logo_guid = '';
	}

	const location = college ? locateCampus(team, row) : locateVenue(config, team, venue, row);
	if (location) Object.assign(row, location);
	else problems.push(`${league} ${row.name}: no location (${row.venue}, ${row.city})`);
	if (!STATE_NAMES[row.state]) problems.push(`${league} ${row.name}: unknown state "${row.state}"`);
	return row;
}

/**
 * The key of the team's logos (`/i/teamlogos/<folder>/500/<key>.png`, and `500-dark`) and its guid
 * if it has a logo made to sit on its color (`/guid/<guid>/logos/...`), to build their URLs from
 * (see `$lib/utils/sports.ts`)
 */
function logoKeys(league, team) {
	const href = (rel) => team.logos?.find((l) => l.rel.includes(rel))?.href;
	// Some smaller colleges have none (shown without one)
	if (!href('default')) return { logo_key: '', logo_guid: '' };
	const folder = LOGO_FOLDERS[league] ?? 'ncaa';
	const key = href('default')?.match(/\/i\/teamlogos\/[^/]+\/500\/([^/]+)\.png$/)?.[1] ?? '';
	if (href('default') !== `https://a.espncdn.com/i/teamlogos/${folder}/500/${key}.png`) {
		problems.push(`${league} ${team.displayName}: unexpected logo ${href('default')}`);
	}
	const dark = href('dark');
	if (dark && dark !== `https://a.espncdn.com/i/teamlogos/${folder}/500-dark/${key}.png`) {
		problems.push(`${league} ${team.displayName}: unexpected dark logo ${dark}`);
	}
	const onColor = href('primary_logo_on_primary_color');
	const guid = onColor?.includes(`/guid/${team.guid}/`) ? team.guid : '';
	if (onColor && !guid) problems.push(`${league} ${team.displayName}: unexpected logo ${onColor}`);
	return { logo_key: key, logo_guid: guid };
}

/**
 * A college logo's main colors: its most common colorful one, and the next that's clearly different
 * (or white), from a small copy of it.  Black (and white) if it has none, as some are grayscale.
 */
async function logoColors(key) {
	const pixels = await logoPixels(`/i/teamlogos/ncaa/500/${key}.png`);
	if (!pixels) return {};

	// Opaque, colorful pixels, by their color (to 3 bits a channel)
	const buckets = new Map();
	let opaque = 0;
	for (let i = 0; i < pixels.length; i += 4) {
		const [r, g, b, a] = pixels.subarray(i, i + 4);
		if (a < 200) continue;
		opaque++;
		const max = Math.max(r, g, b);
		if (max < 40 || (max - Math.min(r, g, b)) / max < 0.35) continue; // black, white or gray
		const key = (r >> 5) * 64 + (g >> 5) * 8 + (b >> 5);
		const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
		bucket.n++;
		bucket.r += r;
		bucket.g += g;
		bucket.b += b;
		buckets.set(key, bucket);
	}
	// Each common color's average (at least 5% of the logo, to skip anti-aliased edges)
	const colors = sort(buckets.values(), (b) => -b.n)
		.filter((b) => b.n >= opaque * 0.05)
		.map((b) => [b.r / b.n, b.g / b.n, b.b / b.n]);
	const [color] = colors;
	if (!color) return {};
	const alt = colors.find(
		(c) => Math.hypot(c[0] - color[0], c[1] - color[1], c[2] - color[2]) > 80
	);
	const hex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
	return { color: hex(color), alt_color: alt ? hex(alt) : '#ffffff' };
}

/** Whether at least a tenth of a team's logo made to sit on its color differs from that color */
async function standsOut(guid, color) {
	const pixels = await logoPixels(`/guid/${guid}/logos/primary_logo_on_primary_color.png`);
	if (!pixels) return true;
	const background = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
	let opaque = 0;
	let different = 0;
	for (let i = 0; i < pixels.length; i += 4) {
		if (pixels[i + 3] < 200) continue;
		opaque++;
		const distance = background.reduce((sum, v, c) => sum + Math.abs(pixels[i + c] - v), 0);
		if (distance > 90) different++;
	}
	return different >= opaque * 0.1;
}

/** RGBA pixels of a small (48px) copy of an ESPN logo, or null (reported) if unreadable */
async function logoPixels(path) {
	const url = `https://a.espncdn.com/combiner/i?img=${path}&w=48&h=48`;
	const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } }).catch(() => null);
	const pixels = response?.ok ? decodePng(Buffer.from(await response.arrayBuffer())) : null;
	if (!pixels) problems.push(`logo ${path}: unable to read it`);
	return pixels;
}

/** RGBA pixels of an 8-bit, non-interlaced RGB(A) PNG (as ESPN's image service makes), or null */
function decodePng(buffer) {
	let width = 0;
	let height = 0;
	let colorType = 0;
	const data = [];
	for (let offset = 8; offset < buffer.length; ) {
		const length = buffer.readUInt32BE(offset);
		const type = buffer.toString('latin1', offset + 4, offset + 8);
		const chunk = buffer.subarray(offset + 8, offset + 8 + length);
		if (type === 'IHDR') {
			width = chunk.readUInt32BE(0);
			height = chunk.readUInt32BE(4);
			colorType = chunk[9];
			// Bit depth 8, RGB or RGBA, not interlaced
			if (chunk[8] !== 8 || (colorType !== 2 && colorType !== 6) || chunk[12] !== 0) return null;
		} else if (type === 'IDAT') data.push(chunk);
		else if (type === 'IEND') break;
		offset += 12 + length;
	}
	const channels = colorType === 6 ? 4 : 3;
	const stride = width * channels;
	const raw = inflateSync(Buffer.concat(data));
	const pixels = new Uint8Array(width * height * 4);
	let previous = new Uint8Array(stride);
	for (let y = 0; y < height; y++) {
		const filter = raw[y * (stride + 1)];
		const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
		const row = new Uint8Array(stride);
		for (let i = 0; i < stride; i++) {
			// Undo the row's filter, from the bytes to the left (a), above (b) and above-left (c)
			const a = i >= channels ? row[i - channels] : 0;
			const b = previous[i];
			const c = i >= channels ? previous[i - channels] : 0;
			const p = a + b - c;
			const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
			const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
			row[i] = (line[i] + [0, a, b, (a + b) >> 1, paeth][filter]) & 255;
		}
		for (let x = 0; x < width; x++) {
			const pixel = row.subarray(x * channels, x * channels + 3);
			pixels.set([...pixel, channels === 4 ? row[x * channels + 3] : 255], (y * width + x) * 4);
		}
		previous = row;
	}
	return pixels;
}

/** A college's campus: the school in its venue's city whose name best matches ESPN's */
function locateCampus(team, row) {
	const located = CAMPUS_LOCATIONS[team.location];
	if (located) {
		const { name, city, state, latitude, longitude } = located;
		return {
			campus: name,
			city,
			state,
			latitude: latitude.toFixed(4),
			longitude: longitude.toFixed(4)
		};
	}
	const override = CAMPUS_IDS[team.location];
	let campus = override != null ? colleges.byId.get(String(override)) : null;
	if (!campus) {
		const words = nameWords(team.location);
		const best = greatest(
			colleges.all
				.filter((c) => c.STABBR === row.state && sameName(c.CITY, row.city))
				.map((c) => {
					const name = nameWords(`${c.INSTNM} ${c.IALIAS}`);
					// Share of ESPN's name in the school's, ties going to the largest school
					return { c, score: words.filter((w) => name.includes(w)).length / words.length };
				}),
			(a, b) => ascending(a.score, b.score) || ascending(a.c.INSTSIZE, b.c.INSTSIZE)
		);
		if (best?.score >= 0.5) campus = best.c;
	}
	if (!campus) {
		// Elsewhere in the state (ex. a stadium in a neighboring town): only the one school with every
		// word of ESPN's name, as a partial or shared match there could well be another school
		const words = nameWords(team.location);
		const matches = colleges.all.filter((c) => {
			if (row.state && c.STABBR !== row.state) return false;
			const name = nameWords(`${c.INSTNM} ${c.IALIAS}`);
			return words.every((w) => name.includes(w));
		});
		if (matches.length === 1) campus = matches[0];
	}
	if (!campus) return null;
	return {
		campus: campus.INSTNM,
		city: campus.CITY,
		state: campus.STABBR,
		latitude: Number(campus.LATITUDE).toFixed(4),
		longitude: Number(campus.LONGITUD).toFixed(4)
	};
}

/** A pro team's venue: Wikidata's home venue for the team, or the fixed venue's item */
function locateVenue(config, team, venue, row) {
	const name = WIKIDATA_NAMES[team.displayName] ?? team.displayName;
	const candidates = venue?.wikidata
		? proVenues.byItem.get(venue.wikidata)
		: proVenues.byTeam.get(`${config.wikidata} ${name}`);
	if (!candidates?.length) return null;
	// Prefer the one named like ESPN's (when Wikidata lists more than one)
	const match = candidates.find((c) => similarVenue(c.venue, row.venue)) ?? candidates[0];
	// Fixed venues are already reviewed, and some of Wikidata's have no English name (`Q123`)
	const fixed = VENUE_FIXES[row.league]?.[team.displayName];
	if (!fixed && !/^Q\d+$/.test(match.venue) && !similarVenue(match.venue, row.venue)) {
		problems.push(`${row.league} ${row.name}: ESPN says ${row.venue}, Wikidata ${match.venue}`);
	}
	return { latitude: match.latitude.toFixed(4), longitude: match.longitude.toFixed(4) };
}

/** IPEDS directory of active 4-year colleges */
async function loadColleges() {
	const zip = join(mkdtempSync(join(tmpdir(), 'ipeds-')), 'hd.zip');
	const response = await fetch(IPEDS_URL, { headers: { 'User-Agent': USER_AGENT } });
	if (!response.ok) throw new Error(`Unable to load ${IPEDS_URL} (${response.status})`);
	writeFileSync(zip, Buffer.from(await response.arrayBuffer()));
	const csv = execFileSync('unzip', ['-p', zip], { maxBuffer: 64 * 1024 * 1024 })
		.toString('utf8')
		// Without its byte order mark
		.replace(/^\uFEFF/, '');
	const all = csvParse(csv)
		.filter((c) => c.ICLEVEL === '1' && c.CYACTIVE === '1')
		.map((c) => ({ ...c, INSTSIZE: Number(c.INSTSIZE) }));
	return { all, byId: index(all, (c) => c.UNITID) };
}

/** Current home venue (and its location) of every team in the pro leagues, and fixed venues' */
async function loadProVenues() {
	const leagueItems = leagues.filter((l) => l.wikidata).map((l) => `wd:${l.wikidata}`);
	const fixItems = Object.values(VENUE_FIXES)
		.flatMap((teams) => Object.values(teams))
		.filter((v) => v.wikidata)
		.map((v) => `wd:${v.wikidata}`);

	// A league's teams are those with a current membership and home venue (players also have leagues)
	const teams = await sparql(`
		SELECT ?league ?teamLabel ?venueLabel ?coord WHERE {
			VALUES ?league { ${leagueItems.join(' ')} }
			?team p:P118 ?membership .
			?membership ps:P118 ?league .
			FILTER NOT EXISTS { ?membership pq:P582 ?end }
			?team p:P115 ?venueStatement .
			?venueStatement ps:P115 ?venue .
			FILTER NOT EXISTS { ?venueStatement pq:P582 ?venueEnd }
			?venue wdt:P625 ?coord .
			SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
		}`);
	const byTeam = rollup(
		teams,
		(bindings) => bindings.map(venueLocation),
		(b) => `${b.league.value.split('/').pop()} ${b.teamLabel.value}`
	);

	const items = await sparql(`
		SELECT ?venue ?venueLabel ?coord WHERE {
			VALUES ?venue { ${fixItems.join(' ')} }
			?venue wdt:P625 ?coord .
			SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
		}`);
	const byItem = new Map(items.map((b) => [b.venue.value.split('/').pop(), [venueLocation(b)]]));

	return { byTeam, byItem };
}

function venueLocation(binding) {
	// `Point(longitude latitude)`
	const [longitude, latitude] = binding.coord.value.match(/-?[\d.]+/g).map(Number);
	return { venue: binding.venueLabel.value, latitude, longitude };
}

async function sparql(query) {
	const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}`;
	const response = await fetch(url, {
		headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' }
	});
	if (!response.ok) throw new Error(`Wikidata query failed (${response.status})`);
	// Some labels have raw control characters (below a space), which aren't valid in JSON strings
	return JSON.parse((await response.text()).replace(/[^ -\uFFFF]/g, ' ')).results.bindings;
}

/**
 * The teams of each conference in an ESPN group (ex. Division II), from this season's groups (or
 * last season's, before this season's are published)
 */
async function groupTeams({ sport, espnLeague, group }) {
	const year = new Date().getFullYear();
	for (const season of [year, year - 1]) {
		const url = `${CORE_API}/${sport}/leagues/${espnLeague}/seasons/${season}/types/2/groups/${group}/children?limit=100`;
		const conferences = await fetchJson(url).catch(() => null);
		if (!conferences?.count) continue;

		const teams = [];
		for (const item of conferences.items) {
			const conference = await fetchJson(https(item.$ref));
			const list = await fetchJson(`${https(conference.teams.$ref).split('?')[0]}?limit=200`);
			for (const team of list.items) {
				const id = team.$ref.match(/\/teams\/(\d+)/)[1];
				teams.push({
					id,
					subdivision: '',
					conference: conference.shortName ?? conference.name,
					division: ''
				});
			}
		}
		return teams;
	}
	problems.push(`${espnLeague} group ${group}: no conferences`);
	return [];
}

/** ESPN's API links are `http:` */
function https(url) {
	return url.replace(/^http:/, 'https:');
}

/**
 * Teams in a standings response, with their conference and division (only for pro leagues, as
 * college conferences' divisions are only for scheduling)
 */
function standingsTeams(response, divisions = false) {
	const teams = [];
	const walk = (group, path) => {
		for (const entry of group.standings?.entries ?? []) {
			teams.push({
				id: entry.team.id,
				conference: (divisions ? path[0]?.name : (path[0]?.shortName ?? path[0]?.name)) ?? '',
				division: (divisions && path[1]?.name) || ''
			});
		}
		for (const child of group.children ?? []) walk(child, [...path, child]);
	};
	walk(response, []);
	return teams;
}

/** A state or province's code (ESPN gives either) */
function stateCode(state = '') {
	return STATE_CODES[state] ?? state;
}

/** Words of a name, for comparing (ex. "St. John's" → ["saint", "johns"]) */
function nameWords(name) {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/&/g, ' and ')
		.replace(/['’.]/g, '')
		.split(/[^a-z0-9]+/)
		.filter(Boolean)
		.map((w) => (w === 'st' ? 'saint' : w));
}

function sameName(a, b) {
	return nameWords(a).join(' ') === nameWords(b).join(' ');
}

/** Same venue name, give or take a qualifier (ex. "Angel Stadium" and "Angel Stadium of Anaheim") */
function similarVenue(a, b) {
	const [shorter, longer] = [nameWords(a), nameWords(b)].sort((x, y) => x.length - y.length);
	return shorter.every((w) => longer.includes(w));
}

async function mapLimit(items, limit, fn) {
	const results = new Array(items.length);
	let next = 0;
	const worker = async () => {
		while (next < items.length) {
			const i = next++;
			results[i] = await fn(items[i]);
		}
	};
	await Promise.all(Array.from({ length: limit }, worker));
	return results;
}

async function fetchJson(url, retries = 3) {
	const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } }).catch(() => null);
	if (!response?.ok) {
		if (retries > 0) {
			await sleep(2000);
			return fetchJson(url, retries - 1);
		}
		throw new Error(`Unable to load ${url} (${response?.status ?? 'network error'})`);
	}
	return response.json();
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
