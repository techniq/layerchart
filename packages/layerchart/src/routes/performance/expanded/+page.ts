export async function load() {
  return {
    chartData: (await fetch('/data/examples/bench/expanded/data.json').then((r) => r.json())) as {
      epoch: number;
      idl: number;
      recv: number;
      send: number;
      writ: number;
      used: number;
      free: number;
    }[],
  };
}
