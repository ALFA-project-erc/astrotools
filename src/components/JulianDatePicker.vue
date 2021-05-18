<template>
  <q-form class="row" @submit="$emit('submit', { ...ymd })">
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
        max="12"
        :rules="[(val) => (val !== null && val > 0 && val <= 12) || 'Invalid']"
      />
      <q-input
        label="Day"
        v-model.number="ymd.day"
        type="number"
        debounce="500"
        filled
        min="1"
        max="31"
        :rules="[(val) => (val !== null && val > 0 && val <= 31) || 'Invalid']"
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
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { jdnToYmd, ymdToJdn } from "@/kanon-api";
import { defineComponent, Ref, ref } from "vue";

const ymd = {
  day: ref(null) as Ref<number | null>,
  month: ref(null) as Ref<number | null>,
  year: ref(null) as Ref<number | null>,
};

const jdn = ref(null) as Ref<number | null>;

const selectDate = true;

export default defineComponent({
  name: "JulianDatePicker",
  props: { loading: Boolean, percentage: Number },
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
      selectDate,
      ymd,
      jdn,
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
        try {
          this.jdn = await ymdToJdn("Julian A.D.", val);
        } catch (error) {
          this.jdn = null;
        }
      },
      deep: true,
    },
    async jdn(val) {
      if (this.selectDate || val === null) return;
      let ymd: [number | null, number | null, number | null];
      try {
        ymd = (await jdnToYmd("Julian A.D.", val)).ymd;
      } catch (error) {
        ymd = [null, null, null];
      }
      this.ymd.day = ymd[2];
      this.ymd.month = ymd[1];
      this.ymd.year = ymd[0];
    },
  },
});
</script>

<style scoped>
/* .q-form {
  margin: 20px;
} */
.q-input {
  max-width: 120px;
}
</style>
