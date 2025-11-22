export type WorldLinksData = Array<
  GeoJSON.Feature<
    GeoJSON.LineString,
    { sourceName: string; targetName: string; sourceId: string; targetId: string }
  > & {
    sourceId: string;
    targetId: string;
    source: [number, number];
    target: [number, number];
  }
>;

// [
//   {
//     "feature": {
//       "type": "Feature",
//       "geometry": {
//         "type": "LineString",
//         "coordinates": [
//           [-118.18192636994041, 33.99192410876543],
//           [-77.01136443943716, 38.901495235087054]
//         ]
//       },
//       "properties": {
//         "sourceName": "Los Angeles",
//         "targetName": "Washington, D.C.",
//         "sourceId": "los-angeles",
//         "targetId": "washington,-d.c."
//       }
//     },
//     "sourceId": "los-angeles",
//     "targetId": "washington,-d.c.",
//     "source": [-118.18192636994041, 33.99192410876543],
//     "target": [-77.01136443943716, 38.901495235087054]
//   },
