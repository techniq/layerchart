import type { GeometryCollection, MultiPolygon, Topology } from 'topojson-specification';

// Built by `scripts/natural-earth-admin.mjs` from Natural Earth's 10m admin-1 states and provinces

/** `admin0.json` — every country, `id` being Natural Earth's `adm0_a3` (e.g. "ITA") */
export type Admin0Topology = Topology<{
  countries: GeometryCollection<{
    name: string;
    /** Natural Earth's, but with Russia in Asia */
    continent: string;
    /** The World Bank's, e.g. "Europe & Central Asia" */
    worldRegion: string;
  }>;
  /** The countries merged by `continent`, and each without its far-off islands and territories */
  continents: GeometryCollection<{ name: string }>;
  continentFits: GeometryCollection<{ name: string }>;
  /** The countries merged by `worldRegion`, and each without its far-off islands and territories */
  worldRegions: GeometryCollection<{ name: string }>;
  worldRegionFits: GeometryCollection<{ name: string }>;
}>;

export type Admin1Properties = {
  name: string;
  /** e.g. "State", "Province", "Metropolitan department" */
  type: string | null;
  /** Grouping above admin-1 (Italy's regions over its provinces), `null` where there is none */
  region: string | null;
  /** ISO 3166-2, e.g. "US-CA" */
  code: string | null;
  /** FIPS 10-4, e.g. "US06" (the last two digits are the US state's FIPS code) */
  fips: string | null;
};

/** `admin1/<adm0_a3>.json` — one country's states and provinces, `id` being their `adm1_code` */
export type Admin1Topology = Topology<{
  /** Each a MultiPolygon (empty for specks too small to keep), so they can be merged */
  admin1: GeometryCollection<Admin1Properties> & { geometries: MultiPolygon<Admin1Properties>[] };
  /** Admin-1 merged by `region`, for countries where admin-1 is the second level down */
  regions?: GeometryCollection<{ name: string }>;
  /** The country without its far-off islands and territories, to fit to */
  fit: MultiPolygon;
}>;
