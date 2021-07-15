<template>
  <q-form class="row" @submit="$emit('submit', { ...dateParams, jdn, date })">
    <div class="column" v-if="selectDate">
      <div class="row q-gutter-sm">
        <q-input
          label="Year"
          v-model.number="YMD.year"
          debounce="500"
          type="number"
          filled
          lazy-rules
          :rules="[(val) => val != undefined || 'Invalid']"
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
            (val) =>
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
            (val) =>
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
        :rules="[(val) => val != undefined || 'Invalid']"
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

<script lang="ts">
import {
  DateParams,
  DateResponse,
  JdnResponse,
  jdnToDate,
  ymdToDate,
} from "@/kanon-api";
import { fracToHM } from "@/utils";
import { computed, defineComponent, ref, watch } from "vue";

const emptyYMD = {
  day: undefined,
  month: undefined,
  year: undefined,
};

export default defineComponent({
  name: "DatePicker",
  props: {
    loading: Boolean,
    percentage: Number,
    calendar: { type: String, required: true },
    maxDays: { type: Number, required: true },
    maxMonth: { type: Number, required: true },
    startingJdn: Number,
    withTime: { type: Boolean, default: false },
  },
  emits: {
    submit: (data: {
      day?: number;
      month?: number;
      year?: number;
      hours?: number;
      minutes?: number;
      date: string | undefined;
      jdn: number | undefined;
    }) =>
      data.day != undefined &&
      data.month != undefined &&
      data.year != undefined,
  },
  setup(props, { emit }) {
    const selectDate = ref(true);
    const YMD = ref<{
      day: number | undefined;
      month: number | undefined;
      year: number | undefined;
    }>(emptyYMD);
    const jdn = ref<number | undefined>(props.startingJdn ?? undefined);
    const date = ref<string | undefined>(undefined);
    const time = ref("12:00");

    const dateParams = computed<DateParams | undefined>(() => {
      if (
        YMD.value.day == undefined ||
        YMD.value.month == undefined ||
        YMD.value.year == undefined
      )
        return;
      const split = time.value.split(":");
      return {
        ...YMD.value,
        hours: Number.parseInt(split[0]),
        minutes: Number.parseInt(split[1]),
      } as DateParams;
    });

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
        YMD.value = {
          day: response.ymd[2],
          month: response.ymd[1],
          year: response.ymd[0],
        };
        time.value = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      }
    };

    watch(
      jdn,
      async (val) => {
        if (selectDate.value || val == undefined) return;
        try {
          await watchJdn(val);
        } catch {
          if (val == jdn.value) YMD.value = emptyYMD;
        }
      },
      { immediate: true }
    );

    if (props.startingJdn != undefined) {
      selectDate.value = false;
      watchJdn(props.startingJdn)
        .then(() =>
          emit("submit", {
            ...dateParams.value,
            date: date.value,
            jdn: jdn.value,
          })
        )
        .catch()
        .finally(() => (selectDate.value = true));
    }

    return {
      selectDate,
      dateParams,
      jdn,
      date,
      YMD,
      time,
    };
  },
});
</script>

<style scoped>
.q-input {
  max-width: 120px;
}
</style>
