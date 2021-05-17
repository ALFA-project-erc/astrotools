<template>
  <q-form class="row" @submit="$emit('submit', { ...ymd })">
    <div class="row q-gutter-sm">
      <q-input
        label="Year"
        v-model.number="ymd.year"
        type="number"
        filled
        lazy-rules
        :rules="[(val) => val !== null || 'Invalid']"
      />
      <q-input
        label="Month"
        v-model.number="ymd.month"
        type="number"
        filled
        min="1"
        max="12"
        :rules="[(val) => (val !== null && val > 0 && val <= 12) || 'Invalid']"
      />
      <q-input
        label="Day"
        v-model.number="ymd.day"
        type="number"
        filled
        min="1"
        max="31"
        :rules="[(val) => (val !== null && val > 0 && val <= 31) || 'Invalid']"
      />
    </div>
    <q-separator vertical dark size="5px" />
    <div class="col">
      <q-btn
        :loading="loading"
        :percentage="percentage"
        label="Submit"
        type="submit"
        color="primary"
      />
    </div>
  </q-form>
      JDN : <q-badge>{{ jdn }}</q-badge>
</template>

<script lang="ts">
import { ymdToJdn } from "@/kanon-api";
import { defineComponent, Ref, ref } from "vue";

const ymd = {
  day: ref(null) as Ref<number | null>,
  month: ref(null) as Ref<number | null>,
  year: ref(null) as Ref<number | null>,
};

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
      ymd,
      jdn: null as number | null,
    };
  },
  watch: {
    ymd: {
      async handler(val) {
        if (val.day === null || val.month === null || val.year === null) return;
        try {
          this.jdn = await ymdToJdn("Julian A.D.", val);
        } catch (error) {
          this.jdn = null;
        }
      },
      deep: true,
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
