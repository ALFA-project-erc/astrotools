import axios from "axios";
import { Planet } from "./enums";

const BASE_URL = "http://localhost:8000";

export const kanonClient = axios.create({
  baseURL: BASE_URL,
});

type BasedQuantityResponse = {
  value: string;
  unit: string;
};

export const getTruePosition = async (
  planet: Planet,
  date: { day: number; month: number; year: number }
): Promise<string> => {
  const response = (
    await kanonClient.get<BasedQuantityResponse>(
      `ephemerides/${planet}/true_pos/`,
      { params: date }
    )
  ).data;
  return response.value;
};

export const getAscendant = async (date: {
  day: number;
  month: number;
  year: number;
}): Promise<string> => {
  const response = (
    await kanonClient.get<BasedQuantityResponse>(`ephemerides/ascendant/`, {
      params: date,
    })
  ).data;
  return response.value;
};
