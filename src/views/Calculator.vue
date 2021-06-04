<template>
  <q-form @submit="compute()">
    <q-select
      :options="radices"
      label="Numerical base"
      v-model="selectedRadix"
    />
    <q-input label="Query" v-model="query" filled maxlength="40" />
    <q-btn type="submit" label="Compute" :loading="loading" />
  </q-form>
  {{ result }}
</template>

<script lang="ts">
import { getCalcCompute, getOpenAPISchema } from "@/kanon-api";
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  setup() {
    const radices = ref<string[]>([]);
    const selectedRadix = ref<string | null>(null);

    onMounted(async () => {
      radices.value = (
        await getOpenAPISchema()
      ).components.schemas.SupportedRadices.enum;
      selectedRadix.value = radices.value[0];
    });

    const loading = ref(false);
    const result = ref<string>("");
    const query = ref<string>("");

    const compute = async () => {
      if (!selectedRadix.value || !query.value) return;
      loading.value = true;
      try {
        const res = await getCalcCompute(query.value, selectedRadix.value);
        result.value = `${res.value} | rem: ${res.remainder}`;
      } catch (error) {
        result.value = error.response?.data?.detail;
      }
      loading.value = false;
    };

    return {
      radices,
      selectedRadix,
      loading,
      result,
      compute,
      query,
    };
  },
});
</script>
