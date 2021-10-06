export const SEXA_REGEX =
  /(([0-5][0-9]),)*[0-5][0-9] ; ([0-5][0-9],)*[0-5][0-9]$/;

export const hmToFrac = (hours: number, minutes: number): number =>
  (hours + minutes / 60) / 24;
export const fracToHM = (frac: number): { hours: number; minutes: number } => ({
  hours: Math.floor(frac * 24),
  minutes: Math.floor(((frac * 24) % 1) * 60),
});

const splitSexa = (sexa: string): [string[], string[]] => {
  const parts = sexa.replaceAll(" ", "").split(";");
  return [parts[0].split(","), parts[1].split(",")];
};

export const sexaToDecimal = (sexa: string): number => {
  const [intParts, floatParts] = splitSexa(sexa);

  let negative = 1;

  if (intParts[0][0] == "-") {
    negative = -1;
    intParts[0] = intParts[0].split("-")[1];
  }

  let value = Number.parseInt(intParts[0]);

  if (intParts.length > 1) value = value * 60 + Number.parseInt(intParts[1]);

  for (let i = 0; i < floatParts.length; i++) {
    value += Number.parseInt(floatParts[i]) / 60 ** (i + 1);
  }

  return negative * value;
};

export const sexaPretty = (sexa: string): string => {
  const [intParts, floatParts] = splitSexa(sexa);

  intParts[intParts.length - 1] =
    intParts[intParts.length - 1].padStart(2, "0") + "°";
  if (intParts.length > 1) {
    intParts[0] = intParts[0].padStart(2, "0") + "s";
  }
  for (let i = 0; i < floatParts.length; i++) {
    floatParts[i] = floatParts[i].padStart(2, "0");
    floatParts[i] += "'".repeat(i + 1);
  }

  return intParts.join("") + " ; " + floatParts.join("");
};
