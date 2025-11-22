export type PenguinsData = {
  species: string;
  island: string;
  bill_length_mm: number | 'NA';
  bill_depth_mm: number | 'NA';
  flipper_length_mm: number | 'NA';
  body_mass_g: number | 'NA';
  sex: 'male' | 'female' | 'NA';
  year: number;
}[];
