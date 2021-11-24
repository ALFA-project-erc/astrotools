<template>
  <q-form class="row" @submit="submit">
    <div class="column" v-if="selectDate">
      <div class="row q-gutter-sm">
        <q-input
          label="Year"
          v-model.number="YMD.year"
          debounce="500"
          type="number"
          filled
          lazy-rules
          :rules="[(val: any) => val != undefined || 'Invalid']"
        />
        <q-input
          label="Month"
          v-model.number="YMD.month"
          type="number"
          debounce="500"
          filled
          min="1"
          :max="maxMonth"
          :rules="[
            (val: any) =>
              (val != undefined && val > 0 && val <= maxMonth) || 'Invalid',
          ]"
        />
        <q-input
          label="Day"
          v-model.number="YMD.day"
          type="number"
          debounce="500"
          filled
          min="1"
          :max="maxDays"
          :rules="[
            (val: any) =>
              (val != undefined && val > 0 && val <= maxDays) || 'Invalid',
          ]"
        />
      </div>
      <div class="row justify-end" v-if="withTime">
        <q-input filled v-model="time" mask="time" :rules="['time']">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time v-model="time" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <div v-else>
      <q-input
        debounce="500"
        label="JDN"
        v-model.number="jdn"
        type="number"
        step="any"
        filled
        lazy-rules
        :rules="[(val: any) => val != undefined || 'Invalid']"
      />
    </div>
    <q-separator vertical dark size="5px" />
    <div class="column q-gutter-sm">
      <q-btn
        :label="selectDate ? 'To JDN' : 'To Date'"
        color="secondary"
        @click="selectDate = !selectDate"
      />
      <q-btn
        :loading="loading"
        :percentage="percentage"
        label="Submit"
        type="submit"
        color="primary"
        :disable="jdn == undefined || dateParams == undefined"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import {
  DateParams,
  DateResponse,
  JdnResponse,
  jdnToDate,
  ymdToDate,
} from "@/kanon-api";
import { fracToHM, pad2 } from "@/utils";
import {
  computed,
  reactive,
  ref,
  watch,
  defineProps,
  defineEmits,
  withDefaults,
} from "vue";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    percentage?: number;
    calendar: string;
    maxDays: number;
    maxMonth: number;
    startingJdn?: number;
    withTime?: boolean;
  }>(),
  { withTime: false }
);

const emits = defineEmits<{
  (
    e: "submit",
    data: {
      date: string;
      jdn: number;
    } & DateParams
  ): void;
}>();

const selectDate = ref(true);
const YMD = reactive<{
  day?: number;
  month?: number;
  year?: number;
}>({ day: undefined, month: undefined, year: undefined });
const jdn = ref<number | undefined>(props.startingJdn);
const date = ref<string | undefined>(undefined);
const time = ref("12:00");

const dateParams = computed<DateParams | undefined>(() => {
  if (YMD.day == undefined || YMD.month == undefined || YMD.year == undefined)
    return;
  const split = time.value.split(":");
  return {
    ...YMD,
    hours: Number.parseInt(split[0]),
    minutes: Number.parseInt(split[1]),
  } as DateParams;
});

const submit = () => {
  if (dateParams.value && jdn.value && date.value)
    emits("submit", { ...dateParams.value, jdn: jdn.value, date: date.value });
};

watch(
  dateParams,
  async (val) => {
    if (val == undefined || !selectDate.value) return;
    jdn.value = undefined;
    let response: JdnResponse | undefined;
    try {
      response = await ymdToDate(props.calendar, val);
    } catch (error) {
      response = undefined;
    }
    if (val == dateParams.value) {
      jdn.value = response?.jdn;
      date.value = response?.date;
    }
  },
  { immediate: true, deep: true }
);

const watchJdn = async (val: number) => {
  let response: DateResponse | undefined;
  response = await jdnToDate(props.calendar, val);
  if (val == jdn.value) {
    date.value = response.date;
    const { hours, minutes } = fracToHM(response.frac);
    YMD.day = response.ymd[2];
    YMD.month = response.ymd[1];
    YMD.year = response.ymd[0];

    time.value = `${pad2(hours)}:${pad2(minutes)}`;
  }
  return { ...dateParams.value, jdn: val, date: date.value } as {
    jdn: number;
    date: string;
  } & DateParams;
};

watch(
  jdn,
  async (val) => {
    if (selectDate.value || val == undefined) return;
    try {
      await watchJdn(val);
    } catch {
      if (val == jdn.value) {
        YMD.day = undefined;
        YMD.month = undefined;
        YMD.year = undefined;
      }
    }
  },
  { immediate: true }
);

if (props.startingJdn != undefined) {
  selectDate.value = false;
  watchJdn(props.startingJdn)
    .then((res) => emits("submit", res))
    .catch()
    .finally(() => (selectDate.value = true));
}
</script>

<style scoped>
.q-input {
  max-width: 120px;
}
</style>
