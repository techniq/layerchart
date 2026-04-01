import { Context } from 'runed';
import type { Examples } from './types';

export const examples = new Context<{ readonly current: Examples }>('examples');
