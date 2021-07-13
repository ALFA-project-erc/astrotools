export const SEXA_REGEX =
  /(([0-5][0-9]),)*[0-5][0-9] ; ([0-5][0-9],)*[0-5][0-9]$/;

export const hmToFrac = (hours: number, minutes: number): number =>
  (hours + minutes / 60) / 24;
export const fracToHM = (frac: number): { hours: number; minutes: number } => ({
  hours: Math.floor(frac * 24),
  minutes: Math.floor((Math.floor(frac * 24) % 1) * 60),
});
