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

export const pad2 = (str: number): string => str.toString().padStart(2, "0");

export const convertFloat = (sexa: {
  degrees: number;
  minutes: number;
}): number =>
  (Math.abs(sexa.degrees) + sexa.minutes / 60) * Math.sign(sexa.degrees);

export const retrieveFromPromise = async function <T>(
  promise: Promise<T>,
  errorReturn: T
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    return errorReturn;
  }
};

export const snakeCaseToTitleCase = (str: string): string =>
  str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
