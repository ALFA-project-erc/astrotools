<template>
  <q-form @submit="compute()">
    <q-select
      :options="radices"
      title="Select a numerical base"
      v-model="selectedRadix"
    />
    <q-input label="Query" v-model="query" filled maxlength="40" />
    <q-btn type="submit" label="Compute" :loading="loading" />
  </q-form>
  {{ result }}
</template>

<script lang="ts">
import { getCalcCompute, getOpenAPISchema } from "@/kanon-api";
import { defineComponent, ref } from "vue";

export default defineComponent({
  data() {
    return {
      result: "",
      query: ref<string>(""),
      radices: [] as string[],
      selectedRadix: ref<string | null>(null),
      loading: false,
    };
  },
  async created() {
    this.radices = (
      await getOpenAPISchema()
    ).components.schemas.SupportedRadices.enum;
    this.selectedRadix = this.radices[0];
  },
  methods: {
    async compute() {
      if (!this.selectedRadix || !this.query) return;
      this.loading = true;
      try {
        this.result = await getCalcCompute(this.query, this.selectedRadix);
      } catch (error) {
        this.result = "Error";
      }
      this.loading = false;
    },
  },
});
</script>
