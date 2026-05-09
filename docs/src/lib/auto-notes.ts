export type Note = {
	text: string; /* the text of the note */
	search?: string | RegExp; /* default '' - diplays for any source */
	layers?: ('svg' | 'canvas' | 'html')[]; /* default [] = shows for all layers */
	type?: 'basic' | 'note' | 'tip' | 'warning' | 'caution'; /* default 'warning' */
};

export const autoNotes: Note[] = [
	// {
	// 	text: 'your source include the word "createDateSeries" and your layer is "canvas"',
	// 	search: '/createDateSeries/',
	// 	layers: ['canvas'],
	// 	type: 'caution'
	// },
	// {
	// 	text: 'your source include the word "integer" and your layer is "canvas"',
	// 	search: '/integer/',
	// 	layers: ['canvas']
	// }
];
