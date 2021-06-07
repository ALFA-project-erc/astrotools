<template>
  <q-form class="row" @submit="$emit('submit', { ...ymd, jdn })">
    <div class="row q-gutter-sm" v-if="selectDate">
      <q-input
        label="Year"
        v-model.number="ymd.year"
        debounce="500"
        type="number"
        filled
        lazy-rules
        :rules="[(val) => val !== null || 'Invalid']"
      />
      <q-input
        label="Month"
        v-model.number="ymd.month"
        type="number"
        debounce="500"
        filled
        min="1"
        :max="maxMonth"
        :rules="[
          (val) => (val !== null && val > 0 && val <= maxMonth) || 'Invalid',
        ]"
      />
      <q-input
        label="Day"
        v-model.number="ymd.day"
        type="number"
        debounce="500"
        filled
        min="1"
        :max="maxDays"
        :rules="[
          (val) => (val !== null && val > 0 && val <= maxDays) || 'Invalid',
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
        :rules="[(val) => val !== null || 'Invalid']"
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
        :disable="jdn === null"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { jdnToYmd, ymdToJdn } from "@/kanon-api";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "DatePicker",
  props: {
    loading: Boolean,
    percentage: Number,
    calendar: { type: String, required: true },
    maxDays: { type: Number, required: true },
    maxMonth: { type: Number, required: true },
  },
  emits: {
    submit: (data: {
      day: number | null;
      month: number | null;
      year: number | null;
    }) => {
      return data.day !== null && data.month !== null && data.year !== null;
    },
  },
  data() {
    return {
      selectDate: true,
      ymd: {
        day: ref<number | null>(null),
        month: ref<number | null>(null),
        year: ref<number | null>(null),
      },
      jdn: ref<number | null>(null),
    };
  },
  watch: {
    ymd: {
      async handler(val) {
        if (
          !this.selectDate ||
          val.day === null ||
          val.month === null ||
          val.year === null
        )
          return;
        this.jdn = null;
        try {
          this.jdn = await ymdToJdn(this.calendar, val);
        } catch (error) {
          if (val == this.ymd) this.jdn = null;
        }
      },
      immediate: true,
      deep: true,
    },
    async jdn(val) {
      if (this.selectDate || val === null) return;
      let ymd: [number | null, number | null, number | null];
      try {
        ymd = (await jdnToYmd(this.calendar, val)).ymd;
      } catch (error) {
        ymd = [null, null, null];
      }
      if (val == this.jdn) {
        this.ymd.day = ymd[2];
        this.ymd.month = ymd[1];
        this.ymd.year = ymd[0];
      }
    },
  },
});
</script>

<style scoped>
.q-input {
  max-width: 120px;
}
</style>