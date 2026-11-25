/** ESPN's logo folder (`/i/teamlogos/<folder>/...`) of each league (colleges share `ncaa`) */
const LOGO_FOLDERS: Record<string, string> = {
	mlb: 'mlb',
	nfl: 'nfl',
	nba: 'nba',
	nhl: 'nhl',
	wnba: 'wnba'
};

export type SportsLogoVariant =
	/** For light backgrounds */
	| 'default'
	/** For dark backgrounds */
	| 'dark'
	/** Made to sit on the team's primary color (falling back to `dark` if the team has none) */
	| 'on-color';

/**
 * URL of a team's logo, from ESPN (resized by its image service, as the originals are 500px or
 * larger, up to 150KB).
 *
 * ```svelte
 * <img src={sportsLogo(team, { variant: 'dark', size: 64 })} alt="" />
 * ```
 */
export function sportsLogo(
	team: { league: string; logo_key: string | number; logo_guid?: string | null },
	{ variant = 'default', size = 64 }: { variant?: SportsLogoVariant; size?: number } = {}
) {
	const path =
		variant === 'on-color' && team.logo_guid
			? `/guid/${team.logo_guid}/logos/primary_logo_on_primary_color.png`
			: `/i/teamlogos/${LOGO_FOLDERS[team.league] ?? 'ncaa'}/${variant === 'default' ? '500' : '500-dark'}/${team.logo_key}.png`;
	return `https://a.espncdn.com/combiner/i?img=${path}&w=${size}&h=${size}`;
}
