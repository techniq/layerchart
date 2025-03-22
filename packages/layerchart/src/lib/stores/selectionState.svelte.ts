import { uniqueState } from './uniqueState.svelte.js';

export type SelectionProps<T> = {
  /** Initial values */
  initial?: T[];

  /** All values to select when `toggleAll()` is called */
  all?: T[];

  /** Only allow 1 selected value */
  single?: boolean;

  /** Maximum number of values that can be selected  */
  max?: number;
};

export type SelectionState<T> = ReturnType<typeof createSelectionState<T>>;

export function createSelectionState<T>(props: SelectionProps<T> = {}) {
  const selected = uniqueState(props.initial ?? []);
  const selectedArr = $derived([...selected.current.values()]);
  let all = $state(props.all ?? []);
  const single = props.single ?? false;
  const max = props.max;

  function isSelected(value: T) {
    return selected.current.has(value);
  }

  function isEmpty() {
    return selectedArr.length === 0;
  }

  function isAllSelected() {
    return all.every((v) => selected.current.has(v));
  }

  function isAnySelected() {
    return all.some((v) => selected.current.has(v));
  }

  function isMaxSelected() {
    return max != null ? selected.current.size >= max : false;
  }

  function isDisabled(value: T) {
    return !isSelected(value) && isMaxSelected();
  }

  function clear() {
    selected.reset();
  }

  function reset() {
    selected.reset();
    selected.addEach(props.initial ?? []);
  }

  function setSelected(values: T[]) {
    if (max == null || values.length < max) {
      selected.reset();
      selected.addEach(values);
    }
  }

  function toggleSelected(value: T) {
    if (selected.current.has(value)) {
      // Remove
      const prevSelected = [...selected.current];
      selected.reset();
      selected.addEach(prevSelected.filter((v) => v != value));
    } else if (single) {
      // Replace
      selected.reset();
      selected.add(value);
    } else {
      // Add
      if (max == null || selected.current.size < max) {
        return selected.add(value);
      }
    }
  }

  function toggleAll() {
    let values: T[];
    if (isAllSelected()) {
      // Deselect all (within current `all`, for example page/filtered result)
      values = [...selected.current].filter((v) => !all.includes(v));
    } else {
      // Select all (`new Set()` will dedupe)
      values = [...selected.current, ...all];
    }
    selected.reset();
    selected.addEach(values);
  }

  return {
    get selected() {
      return single ? (selectedArr[0] ?? null) : selectedArr;
    },
    setSelected,
    toggleSelected,
    isSelected,
    isDisabled,
    toggleAll,
    isAllSelected,
    isAnySelected,
    isMaxSelected,
    isEmpty,
    clear,
    reset,
    get all() {
      return all;
    },
  };
}
