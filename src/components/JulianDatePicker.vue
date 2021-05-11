<template>
  <q-form @submit="onSubmit">
    <div class="q-gutter-sm row">
      <q-input
        label="Year"
        v-model.number="yearModel"
        type="number"
        filled
        style="max-width: 100px"
      />
      <q-input
        label="Month"
        v-model.number="monthModel"
        type="number"
        filled
        style="max-width: 100px"
      />
      <q-input
        label="Day"
        v-model.number="dayModel"
        type="number"
        filled
        style="max-width: 100px"
      />
      <q-btn label="Submit" type="submit" color="primary" />
    </div>
  </q-form>
</template>

<script lang="ts">
import { Ref, ref } from "vue";

export default {
  setup(): {
    dayModel: Ref<number>;
    monthModel: Ref<number>;
    yearModel: Ref<number>;
    onSubmit: () => void;
  } {
    const dayModel = ref(1);
    const monthModel = ref(1);
    const yearModel = ref(0);
    return {
      dayModel,
      monthModel,
      yearModel,
      onSubmit() {
        console.log(dayModel.value, monthModel.value, yearModel.value);
      },
    };
  },
};
</script>

<style scoped>
.q-form {
  margin: 20px;
}
</style>
