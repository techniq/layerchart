import { SvelteSet } from 'svelte/reactivity';

/**
 * State to manage unique values using `SvelteSet` with improved
 * ergonomics and better control of updates
 */
export function uniqueState<T = string | number>(initialValues?: T[]) {
  const current = new SvelteSet<T>(initialValues ?? []);

  return {
    current,
    reset() {
      current.clear();
    },
    add(value: T) {
      current.add(value);
    },
    addEach(values: T[]) {
      for (const value of values) {
        current.add(value);
      }
    },
    delete(value: T) {
      current.delete(value);
    },
    toggle(value: T) {
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
    },
  };
}
