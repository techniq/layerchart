import { flatGroup, sum } from 'd3-array';
import { stack } from 'd3-shape';
import { pivotWider } from './pivot';

export function createStackData(
	data: any[],
	options: { xKey: string; groupBy?: string; stackBy?: string }
) {
	const groupedData = flatGroup(
		data,
		(d) => d[options.xKey],
		(d) => d[options.groupBy]
	);

	const result = groupedData.flatMap((d, i) => {
		const groupKeys = d.slice(0, -1); // all but last item
		const itemData = d.slice(-1)[0]; // last item

		const pivotData = pivotWider(itemData, options.xKey, options.stackBy, 'value');

		const stackKeys: Array<any> = [...new Set(itemData.map((d) => d[options.stackBy]))];
		const stackData = stack().keys(stackKeys)(
			// .offset(offset)
			pivotData
		);

		//console.log({ pivotData, stackData })

		return stackData.flatMap((series) => {
			//console.log({ series })
			return series.flatMap((s) => {
				return {
					...itemData[0], // TODO: More than one should use stacks or aggregate values?
					keys: options.stackBy ? [...groupKeys, series.key] : groupKeys,
					values: options.stackBy ? [s[0], s[1]] : [0, sum(itemData, (d) => d.value)]
				};
			});
		});
	});

	return result;
}
