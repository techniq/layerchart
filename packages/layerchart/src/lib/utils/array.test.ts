import { describe, it, expect } from 'vitest';
import { applyLanes } from './array.js';

describe('applyLanes', () => {
  it('should assign same lane to non-overlapping events', () => {
    const data = [
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02') },
      { id: 2, start: new Date('2023-01-03'), end: new Date('2023-01-05') },
      { id: 3, start: new Date('2023-01-06'), end: new Date('2023-01-08') },
    ];

    const result = applyLanes(data);

    expect(result).toEqual([
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02'), lane: 0 },
      { id: 2, start: new Date('2023-01-03'), end: new Date('2023-01-05'), lane: 0 },
      { id: 3, start: new Date('2023-01-06'), end: new Date('2023-01-08'), lane: 0 },
    ]);
  });

  it('should assign different lanes to overlapping events', () => {
    const data = [
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-03') },
      { id: 2, start: new Date('2023-01-02'), end: new Date('2023-01-04') },
      { id: 3, start: new Date('2023-01-02T12:00:00'), end: new Date('2023-01-05') },
    ];

    const result = applyLanes(data);

    expect(result).toEqual([
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-03'), lane: 0 },
      { id: 2, start: new Date('2023-01-02'), end: new Date('2023-01-04'), lane: 1 },
      { id: 3, start: new Date('2023-01-02T12:00:00'), end: new Date('2023-01-05'), lane: 2 },
    ]);
  });

  it('should reuse lanes when events no longer overlap', () => {
    const data = [
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02') },
      { id: 2, start: new Date('2023-01-01T12:00:00'), end: new Date('2023-01-03') },
      { id: 3, start: new Date('2023-01-04'), end: new Date('2023-01-06') }, // starts after id: 1 ends
      { id: 4, start: new Date('2023-01-05'), end: new Date('2023-01-07') }, // starts after id: 2 ends
    ];

    const result = applyLanes(data);

    expect(result).toEqual([
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02'), lane: 0 },
      { id: 2, start: new Date('2023-01-01T12:00:00'), end: new Date('2023-01-03'), lane: 1 },
      { id: 3, start: new Date('2023-01-04'), end: new Date('2023-01-06'), lane: 0 }, // reuses lane 0
      { id: 4, start: new Date('2023-01-05'), end: new Date('2023-01-07'), lane: 1 }, // reuses lane 1
    ]);
  });

  it('should handle events that start exactly when another ends', () => {
    const data = [
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02') },
      { id: 2, start: new Date('2023-01-02'), end: new Date('2023-01-04') }, // starts exactly when id: 1 ends
      { id: 3, start: new Date('2023-01-01T12:00:00'), end: new Date('2023-01-03') }, // overlaps with both
    ];

    const result = applyLanes(data);

    expect(result).toEqual([
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02'), lane: 0 },
      { id: 2, start: new Date('2023-01-02'), end: new Date('2023-01-04'), lane: 0 }, // can reuse lane 0
      { id: 3, start: new Date('2023-01-01T12:00:00'), end: new Date('2023-01-03'), lane: 1 }, // overlaps, needs new lane
    ]);
  });

  it('should work with string keys for start and end', () => {
    const data = [
      { name: 'Task 1', startTime: new Date('2023-01-01'), endTime: new Date('2023-01-03') },
      { name: 'Task 2', startTime: new Date('2023-01-02'), endTime: new Date('2023-01-04') },
    ];

    const result = applyLanes(data, { start: 'startTime', end: 'endTime' });

    expect(result).toEqual([
      {
        name: 'Task 1',
        startTime: new Date('2023-01-01'),
        endTime: new Date('2023-01-03'),
        lane: 0,
      },
      {
        name: 'Task 2',
        startTime: new Date('2023-01-02'),
        endTime: new Date('2023-01-04'),
        lane: 1,
      },
    ]);
  });

  it('should handle empty array', () => {
    const data: any[] = [];
    const result = applyLanes(data);
    expect(result).toEqual([]);
  });

  it('should handle single event', () => {
    const data = [{ id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02') }];
    const result = applyLanes(data);

    expect(result).toEqual([
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-02'), lane: 0 },
    ]);
  });

  it('should handle complex overlapping scenario', () => {
    const data = [
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-05') }, // long event
      { id: 2, start: new Date('2023-01-02'), end: new Date('2023-01-03') }, // short event inside
      { id: 3, start: new Date('2023-01-02T12:00:00'), end: new Date('2023-01-04') }, // overlaps with both
      { id: 4, start: new Date('2023-01-03'), end: new Date('2023-01-04T12:00:00') }, // overlaps with 1 and 3
      { id: 5, start: new Date('2023-01-06'), end: new Date('2023-01-08') }, // separate event
    ];

    const result = applyLanes(data);

    expect(result).toEqual([
      { id: 1, start: new Date('2023-01-01'), end: new Date('2023-01-05'), lane: 0 },
      { id: 2, start: new Date('2023-01-02'), end: new Date('2023-01-03'), lane: 1 },
      { id: 3, start: new Date('2023-01-02T12:00:00'), end: new Date('2023-01-04'), lane: 2 },
      { id: 4, start: new Date('2023-01-03'), end: new Date('2023-01-04T12:00:00'), lane: 1 }, // can reuse lane 1 since id: 2 ended
      { id: 5, start: new Date('2023-01-06'), end: new Date('2023-01-08'), lane: 0 }, // can reuse lane 0 since id: 1 ended
    ]);
  });

  it('should preserve all original properties', () => {
    const data = [
      {
        id: 1,
        start: new Date('2023-01-01'),
        end: new Date('2023-01-02'),
        name: 'First',
        priority: 'high',
        metadata: { foo: 'bar' },
      },
      {
        id: 2,
        start: new Date('2023-01-01T12:00:00'),
        end: new Date('2023-01-03'),
        name: 'Second',
        priority: 'low',
        metadata: { baz: 'qux' },
      },
    ];

    const result = applyLanes(data);

    expect(result).toEqual([
      {
        id: 1,
        start: new Date('2023-01-01'),
        end: new Date('2023-01-02'),
        name: 'First',
        priority: 'high',
        metadata: { foo: 'bar' },
        lane: 0,
      },
      {
        id: 2,
        start: new Date('2023-01-01T12:00:00'),
        end: new Date('2023-01-03'),
        name: 'Second',
        priority: 'low',
        metadata: { baz: 'qux' },
        lane: 1,
      },
    ]);
  });

  it('should work with numeric values', () => {
    const data = [
      { id: 1, start: 0, end: 3 },
      { id: 2, start: 1, end: 4 },
      { id: 3, start: 5, end: 7 },
    ];

    const result = applyLanes(data);

    expect(result).toEqual([
      { id: 1, start: 0, end: 3, lane: 0 },
      { id: 2, start: 1, end: 4, lane: 1 },
      { id: 3, start: 5, end: 7, lane: 0 }, // can reuse lane 0 since id: 1 ended
    ]);
  });
});
