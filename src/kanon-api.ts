import axios from "axios";
import { Planet } from "./enums";

const BASE_URL = "http://localhost:8000";

export const kanonClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

type TruePosResponse = { jdn: number; position: string }[];

type DateResponse = {
  date: string;
  ymd: [number, number, number];
};

export type EphemeridesResponse = {
  jdn: number;
  position: string;
  imcce: string | undefined;
  diff: string | undefined;
}[];

export type YMD = { day: number; month: number; year: number };

export const getTruePosition = async (
  planet: Planet,
  date: YMD
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
  date: YMD,
  nVal: number,
  step: number
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
  let imcceLong: (string | undefined)[];
  try {
    imcceLong = (await imccePosition(planet, kanonRes[0].jdn, nVal, step)).map(
      (v) => imcceLatToSexa(v.Longitude)
    );
  } catch (error) {
    imcceLong = Array(kanonRes.length);
  }
  return Promise.all(
    kanonRes.map(async (v, idx) => ({
      ...v,
      imcce: imcceLong[idx],
      diff: imcceLong[idx]
        ? await getCalcCompute(`${v.position}-${imcceLong[idx]}`, "Sexagesimal")
        : undefined,
    }))
  );
};

export const getAscendant = async (date: YMD): Promise<string> => {
  const response = (
    await kanonClient.get<{ value: string }>(`ephemerides/ascendant/`, {
      params: date,
    })
  ).data;
  return response.value;
};

export const jdnToYmd = async (
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

export const ymdToJdn = async (
  calendar: string,
  date: YMD
): Promise<number> => {
  const response = (
    await kanonClient.get<{ jdn: number }>(`calendars/${calendar}/to_jdn/`, {
      params: date,
    })
  ).data;
  return response.jdn;
};

export const imccePosition = async (
  planet: Planet,
  jdn: number,
  nVal: number,
  step: number
) => {
  const baseURL =
    "https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php?-rplane=2&-mime=json&-teph=2&-theory=DE406&";
  const options = `-name=${planet}&-type=${
    planet == Planet.Sun ? "star" : "planet"
  }&-ep=${jdn}&-nbd=${nVal}&-step=${step}d`;

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

  if(floatPart[1] == 60){
    floatPart[0] += 1;
    floatPart[1] = 0
}
  const pad = (v: number) => v.toString().padStart(2, "0");

  return `${pad(Math.floor(intPart / 60))},${pad(intPart % 60)} ; ${floatPart
    .map(pad)
    .join(",")}`;
};

export const getCalcCompute = async (query: string, radix: string) => {
  const response = (
    await kanonClient.get<{ result: string }>(`calculations/${radix}/compute`, {
      params: { query },
    })
  ).data;
  return response.result;
};
