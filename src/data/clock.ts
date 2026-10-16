// The current time, overridable so tests and the dev harness can pin "today".
let clock: () => Date = () => new Date();

export const now = (): Date => clock();

export function setClock(fn: (() => Date) | null): void {
  clock = fn ?? (() => new Date());
}
