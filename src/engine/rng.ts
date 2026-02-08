export class RNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(items: T[]): T {
    return items[this.int(0, items.length - 1)];
  }
}

export function parseSeed(search: string): number {
  const params = new URLSearchParams(search);
  const raw = params.get("seed");
  if (!raw) {
    return 12345;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) ? 12345 : value;
}
