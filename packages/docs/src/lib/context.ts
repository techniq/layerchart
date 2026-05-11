import { Context } from 'runed';
import type { Examples } from './examples.js';

export const examples = new Context<{ readonly current: Examples }>('examples');
