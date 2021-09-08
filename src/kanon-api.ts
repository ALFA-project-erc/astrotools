import axios from "axios";
import { Planet } from "./enums";

export const kanonClient = axios.create({
  baseURL: process.env.VUE_APP_KANON_API,
  timeout: 10000,
});

export type TruePosResponse = { jdn: number; position: string }[];

export type DateResponse = {
  date: string;
  ymd: [number, number, number];
  frac: number;
};

export type JdnResponse = {
  date: string;
  jdn: number;
};

export type BasedRealResponse = {
  value: string;
  remainder: string;
};

export type CalendarInfos = {
  common_year: number;
  leap_year: number;
  months: {
    days_cy: number;
    days_ly: number;
    name: string;
    variant: string;
  }[];
  name: string;
  cycle: [number, number];
  era: number;
};

export type EphemeridesResponse = {
  jdn: number;
  position: string;
  imcce?: string;
  diff?: string;
}[];

export type DateParams = {
  day: number;
  month: number;
  year: number;
  hours?: number;
  minutes?: number;
};

export const getTruePosition = async (
  planet: Planet,
  date: DateParams
): Promise<string> => {
  const response = (
    await kanonClient.get<TruePosResponse>(`ephemerides/${planet}/true_pos/`, {
      params: date,
    })
  ).data;
  return response[0].position;
};

export const getEphemerides = async (
  planet: Planet,
  date: DateParams,
  nVal: number,
  step: number,
  imcce: boolean
): Promise<EphemeridesResponse> => {
  const kanonRes = (
    await kanonClient.get<TruePosResponse>(`ephemerides/${planet}/true_pos/`, {
      params: {
        ...date,
        number_of_values: nVal,
        step,
      },
    })
  ).data;
  let imcceAndDiffs: {
    imcce?: string;
    diff?: string;
  }[] = Array(kanonRes.length);
  if (imcce) {
    try {
      const imcceResponse = await imccePosition(
        planet,
        kanonRes[0].jdn,
        nVal,
        step
      );
      imcceAndDiffs = await Promise.all(
        imcceResponse.map(async (v, idx) => {
          const imcce = imcceLatToSexa(v.Longitude);
          return {
            imcce,
            diff: (
              await getCalcCompute(
                `${kanonRes[idx].position}-${imcce}`,
                "Sexagesimal"
              )
            ).value,
          };
        })
      );
    } catch (error) {
      imcceAndDiffs = Array(kanonRes.length);
    }
  }
  return kanonRes.map((v, idx) => ({
    ...v,
    ...imcceAndDiffs[idx],
  }));
};

export const getHouses = async (
  date: DateParams,
  latitude: number
): Promise<string[]> => {
  const response = (
    await kanonClient.get<string[]>(`ephemerides/houses/`, {
      params: { ...date, latitude },
    })
  ).data;
  return response;
};

export const jdnToDate = async (
  calendar: string,
  jdn: number
): Promise<DateResponse> => {
  const response = (
    await kanonClient.get<DateResponse>(`calendars/${calendar}/from_jdn/`, {
      params: { jdn },
    })
  ).data;
  return response;
};

export const ymdToDate = async (
  calendar: string,
  date: DateParams
): Promise<JdnResponse> => {
  const response = (
    await kanonClient.get<JdnResponse>(`calendars/${calendar}/to_jdn/`, {
      params: date,
    })
  ).data;
  return response;
};

export const imccePosition = async (
  planet: Planet,
  jdn: number,
  nVal: number,
  step: number
): Promise<
  {
    Date: string;
    Longitude: string;
  }[]
> => {
  const toledoDiff = 0.011;
  const baseURL =
    "https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php?" +
    "-rplane=2&-mime=json&-teph=2&-theory=DE406&";
  const options = `-name=${planet}&-type=${
    planet == Planet.Sun ? "star" : "planet"
  }&-ep=${jdn + toledoDiff - 1}&-nbd=${nVal}&-step=${step}d`;

  const response = await axios.get<{
    data: { Date: string; Longitude: string }[];
  }>(baseURL + options);
  return response.data.data;
};

const imcceLatToSexa = (str: string) => {
  const parts = str.split("+")[1].split(":");
  const intPart = Number.parseInt(parts[0]);
  const floatPart = [
    Number.parseInt(parts[1]),
    Math.round(Number.parseFloat(parts[2])),
  ];

  if (floatPart[1] == 60) {
    floatPart[0] += 1;
    floatPart[1] = 0;
  }
  const pad = (v: number) => v.toString().padStart(2, "0");

  return `${pad(Math.floor(intPart / 60))},${pad(intPart % 60)} ; ${floatPart
    .map(pad)
    .join(",")}`;
};

export const getCalcCompute = async (
  query: string,
  radix: string
): Promise<BasedRealResponse> => {
  return (
    await kanonClient.get<BasedRealResponse>(`calculations/${radix}/compute/`, {
      params: { query },
    })
  ).data;
};

type OpenAPISchema = {
  components: {
    schemas: {
      SupportedRadices: { enum: string[] };
      SupportedCalendars: { enum: string[] };
      Planet: { enum: string[] };
    };
  };
};

let kanonSchema: OpenAPISchema | null = null;

export const getOpenAPISchema = async (): Promise<OpenAPISchema> => {
  if (!kanonSchema) {
    kanonSchema = (await kanonClient.get<OpenAPISchema>("openapi.json")).data;
  }
  return kanonSchema;
};

export const getCalendarInfos = async (
  calendar: string
): Promise<CalendarInfos> => {
  return (
    await kanonClient.get<CalendarInfos>(
      `calendars/${calendar.replace("/", "\\/")}/infos`
    )
  ).data;
};

export const brToFloat = async (
  radix: string,
  value: string
): Promise<number> => {
  return (
    await kanonClient.get<{ value: number }>(
      `calculations/${radix}/to_float/`,
      {
        params: { value },
      }
    )
  ).data.value;
};
export const brFromFloat = async (
  radix: string,
  value: number,
  precision: number
): Promise<string> => {
  return (
    await kanonClient.get<BasedRealResponse>(
      `calculations/${radix}/from_float/`,
      {
        params: { value, precision },
      }
    )
  ).data.value;
};
