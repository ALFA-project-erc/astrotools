<template>
  <q-form class="row" @submit="$emit('submit', { ...dateParams, jdn, date })">
    <div class="row q-gutter-sm" v-if="selectDate">
      <q-input
        label="Year"
        v-model.number="dateParams.year"
        debounce="500"
        type="number"
        filled
        lazy-rules
        :rules="[(val) => val != undefined || 'Invalid']"
      />
      <q-input
        label="Month"
        v-model.number="dateParams.month"
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
        v-model.number="dateParams.day"
        type="number"
        debounce="500"
        filled
        min="1"
        :max="maxDays"
        :rules="[
          (val) => (val != undefined && val > 0 && val <= maxDays) || 'Invalid',
        ]"
      />
    </div>
    <div v-else>
      <q-input
        debounce="500"
        label="JDN"
        v-model.number="jdn"
        type="number"
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
        :disable="jdn == undefined"
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
import { defineComponent, ref, watch } from "vue";

const emptyDateParams = {
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
    const dateParams = ref<{
      day: number | undefined;
      month: number | undefined;
      year: number | undefined;
      hours?: number;
      minutes?: number;
    }>(emptyDateParams);
    const jdn = ref<number | undefined>(props.startingJdn ?? undefined);
    const date = ref<string | undefined>(undefined);

    watch(
      dateParams,
      async (val) => {
        if (
          !selectDate.value ||
          val.day == undefined ||
          val.month == undefined ||
          val.year == undefined
        )
          return;
        jdn.value = undefined;
        let response: JdnResponse | undefined;
        try {
          response = await ymdToDate(props.calendar, val as DateParams);
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
        dateParams.value = {
          day: response.ymd[2],
          month: response.ymd[1],
          year: response.ymd[0],
          hours,
          minutes,
        };
      }
    };

    watch(
      jdn,
      async (val) => {
        if (selectDate.value || val == undefined) return;
        try {
          await watchJdn(val);
        } catch {
          if (val == jdn.value) dateParams.value = emptyDateParams;
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
    };
  },
});
</script>

<style scoped>
.q-input {
  max-width: 120px;
}
</style>
