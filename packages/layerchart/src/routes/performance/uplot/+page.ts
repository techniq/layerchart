export async function load() {
  return {
    chartData: (await fetch('/data/examples/bench/uplot/data.json').then((r) => r.json())) as {
      date: Number[];
      cpu: Number[];
      ram: Number[];
      tcp: Number[];
    },
  };
}
