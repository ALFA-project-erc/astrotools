<template>
  <q-form
    @submit="
      $emit('submit', {
        day: dayModel,
        month: monthModel,
        year: yearModel,
      })
    "
  >
    <div class="q-gutter-sm row">
      <q-input
        label="Year"
        v-model.number="yearModel"
        type="number"
        filled
        style="max-width: 100px"
        lazy-rules
        :rules="[(val) => val !== null || 'You must enter a valid year']"
      />
      <q-input
        label="Month"
        v-model.number="monthModel"
        type="number"
        filled
        style="max-width: 100px"
        min="1"
        max="12"
        :rules="[
          (val) =>
            (val !== null && val > 0 && val <= 12) ||
            'You must enter a valid month',
        ]"
      />
      <q-input
        label="Day"
        v-model.number="dayModel"
        type="number"
        filled
        style="max-width: 100px"
        min="1"
        max="31"
        :rules="[
          (val) =>
            (val !== null && val > 0 && val <= 31) ||
            'You must enter a valid day',
        ]"
      />
      <q-btn :disable="disabled" label="Submit" type="submit" color="primary" />
    </div>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";

export default defineComponent({
  name: "JulianDatePicker",
  props: ["disabled"],
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
      dayModel: ref(null) as Ref<number | null>,
      monthModel: ref(null) as Ref<number | null>,
      yearModel: ref(null) as Ref<number | null>,
    };
  },
});
</script>

<style scoped>
.q-form {
  margin: 20px;
}
</style>
