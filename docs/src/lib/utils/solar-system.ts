/**
 * The Sun's planets (and Pluto): where they are on a day, how large, and how they turn.
 *
 * Orbits from JPL's "Keplerian Elements for Approximate Positions of the Major Planets" (E. M.
 * Standish, valid 1800–2050), at J2000 with each planet's mean longitude moving at its rate;
 * the other elements are held at J2000, plenty for a picture.  Surface images from Solar System
 * Scope (https://www.solarsystemscope.com/textures), CC BY 4.0.
 */

export type Planet = {
	name: string;
	/** Mean radius, in kilometers */
	radius: number;
	/** Degrees its axis leans from upright to its orbit */
	tilt: number;
	/** Hours to turn once; negative turns backwards (ex. Venus) */
	day: number;
	/** CSS color, where there's no image */
	color: string;
	/** Equirectangular surface image */
	image?: string;
	/** Semi-major axis (AU), eccentricity, inclination, mean longitude, longitude of perihelion, and longitude of the ascending node (degrees), at J2000 */
	elements: [a: number, e: number, i: number, L: number, perihelion: number, node: number];
	/** Degrees of mean longitude a century */
	rate: number;
	/** Rings, from and to, in radii of the planet */
	rings?: [inner: number, outer: number];
};

export const SUN = {
	name: 'Sun',
	radius: 695_700,
	tilt: 7.25,
	day: 609.12,
	color: '#ffcf6b',
	image: '/images/planets/sun.jpg'
};

export const PLANETS: Planet[] = [
	{
		name: 'Mercury',
		radius: 2_439.7,
		tilt: 0.03,
		day: 1_407.6,
		color: '#9c8f84',
		image: '/images/planets/mercury.jpg',
		elements: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
		rate: 149_472.67411175
	},
	{
		name: 'Venus',
		radius: 6_051.8,
		tilt: 177.4,
		day: -5_832.5,
		color: '#e3c58c',
		image: '/images/planets/venus_surface.jpg',
		elements: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
		rate: 58_517.81538729
	},
	{
		name: 'Earth',
		radius: 6_371,
		tilt: 23.44,
		day: 23.93,
		color: '#3d7bd9',
		image: '/images/blue-marble.jpg',
		elements: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0],
		rate: 35_999.37244981
	},
	{
		name: 'Mars',
		radius: 3_389.5,
		tilt: 25.19,
		day: 24.62,
		color: '#c1440e',
		image: '/images/planets/mars.jpg',
		elements: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
		rate: 19_140.30268499
	},
	{
		name: 'Jupiter',
		radius: 69_911,
		tilt: 3.13,
		day: 9.93,
		color: '#d8b48a',
		image: '/images/planets/jupiter.jpg',
		elements: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
		rate: 3_034.74612775
	},
	{
		name: 'Saturn',
		radius: 58_232,
		tilt: 26.73,
		day: 10.66,
		color: '#e3d29b',
		image: '/images/planets/saturn.jpg',
		elements: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
		rate: 1_222.49362201,
		rings: [1.24, 2.27]
	},
	{
		name: 'Uranus',
		radius: 25_362,
		tilt: 97.77,
		day: -17.24,
		color: '#9fd7e0',
		image: '/images/planets/uranus.jpg',
		elements: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503],
		rate: 428.48202785
	},
	{
		name: 'Neptune',
		radius: 24_622,
		tilt: 28.32,
		day: 16.11,
		color: '#4b70dd',
		image: '/images/planets/neptune.jpg',
		elements: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
		rate: 218.45945325
	},
	{
		name: 'Pluto',
		radius: 1_188.3,
		tilt: 122.53,
		day: -153.29,
		color: '#c9b49a',
		elements: [39.48211675, 0.2488273, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
		rate: 145.20780515
	}
];

/** Days from J2000 (noon, 1 January 2000) to `date` */
export function daysSinceJ2000(date: Date) {
	return (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86_400_000;
}

const RAD = Math.PI / 180;

/**
 * Where `planet` is `days` after J2000, in AU from the Sun: `x` towards the March equinox, `y` a
 * quarter turn on along the ecliptic, `z` north of it.  `meanAnomaly` places it at a point of its
 * orbit instead (ex. to trace the whole orbit).
 */
export function positionOf(planet: Planet, days: number, meanAnomaly?: number) {
	const [a, e, i, L, perihelion, node] = planet.elements;
	const longitude = L + (planet.rate * days) / 36_525;
	const M = ((meanAnomaly ?? longitude - perihelion) * RAD) % (2 * Math.PI);
	// Kepler's equation, `E - e sin E = M`, by Newton's method
	let E = M + e * Math.sin(M);
	for (let k = 0; k < 6; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
	// In the plane of the orbit, perihelion along `x`
	const px = a * (Math.cos(E) - e);
	const py = a * Math.sqrt(1 - e * e) * Math.sin(E);
	// Turned by the argument of perihelion, inclination, and ascending node, to the ecliptic
	const w = (perihelion - node) * RAD;
	const O = node * RAD;
	const I = i * RAD;
	const [cw, sw] = [Math.cos(w), Math.sin(w)];
	const [cO, sO] = [Math.cos(O), Math.sin(O)];
	const [cI, sI] = [Math.cos(I), Math.sin(I)];
	return {
		x: (cw * cO - sw * sO * cI) * px + (-sw * cO - cw * sO * cI) * py,
		y: (cw * sO + sw * cO * cI) * px + (-sw * sO + cw * cO * cI) * py,
		z: sw * sI * px + cw * sI * py
	};
}
