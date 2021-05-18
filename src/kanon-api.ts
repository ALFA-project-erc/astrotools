import axios from "axios";
import { Planet } from "./enums";

const BASE_URL = "http://localhost:8000";

export const kanonClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

type BasedQuantityResponse = {
  value: string;
  unit: string;
};

type DateResponse = {
  date: string;
  ymd: [number, number, number];
};

type YMD = { day: number; month: number; year: number };

export const getTruePosition = async (
  planet: Planet,
  date: YMD
): Promise<string> => {
  const response = (
    await kanonClient.get<BasedQuantityResponse>(
      `ephemerides/${planet}/true_pos/`,
      { params: date }
    )
  ).data;
  return response.value;
};

export const getAscendant = async (date: YMD): Promise<string> => {
  const response = (
    await kanonClient.get<BasedQuantityResponse>(`ephemerides/ascendant/`, {
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
    await kanonClient.get<DateResponse>(`calendars/${calendar}/from_jdn`, {
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
    await kanonClient.get<{ jdn: number }>(`calendars/${calendar}/to_jdn`, {
      params: date,
    })
  ).data;
  return response.jdn;
};
