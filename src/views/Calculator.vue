<template>
  <q-card>
    <q-card-section>
      <q-select
        filled
        :options="radices"
        label="Numerical base"
        v-model="selectedRadix"
      />
    </q-card-section>
    <q-separator />
    <q-card-section horizontal class="q-px-md q-pb-md">
      <q-card-section class="col-6 q-gutter-md">
        <div class="text-subtitle1">Arithmetic operations</div>
        <q-input label="Query" v-model="query" filled maxlength="40" />
        <div class="row">
          <q-btn
            type="submit"
            label="Compute"
            @click="compute"
            color="primary"
            :loading="loading"
            :disable="!query"
          />
          <div class="q-pl-md">
            <div class="text-weight-bold">
              {{ result.value }}
            </div>
            <q-item-label caption>{{ result.remainder }}</q-item-label>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="text-subtitle1">Decimal conversion</div>
        <div class="row">
          <div class="q-pr-md">
            <q-input
              :label="selectedRadix"
              v-model="brInput"
              filled
              debounce="500"
              maxlength="40"
            />
            <q-input
              label="Precision"
              type="number"
              dense
              filled
              v-model.number="precision"
              max="10"
              min="0"
            />
          </div>
          <q-input
            label="Decimal"
            debounce="500"
            type="number"
            v-model.number="decInput"
            filled
          />
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  BasedRealResponse,
  brFromFloat,
  brToFloat,
  getCalcCompute,
  getOpenAPISchema,
} from "@/kanon-api";
import { defineComponent, onMounted, ref, watch } from "vue";

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
    const result = ref<BasedRealResponse>({ value: "", remainder: "" });
    const query = ref<string>("");

    const compute = async () => {
      if (!selectedRadix.value || !query.value) return;
      loading.value = true;
      try {
        result.value = await getCalcCompute(query.value, selectedRadix.value);
      } catch (error) {
        result.value.value = error.response?.data?.detail;
        result.value.remainder = "";
      }
      loading.value = false;
    };

    const brInput = ref("00 ; 00, 00");
    const lastBrInput = ref<string | null>(null);
    const decInput = ref(0);
    const lastDecInput = ref<number | null>(null);
    const precision = ref(2);

    watch(brInput, async (val) => {
      if (!selectedRadix.value || val == lastBrInput.value) return;
      try {
        decInput.value = await brToFloat(selectedRadix.value, val);
      } catch (error) {
        console.error(error);
      }
      lastDecInput.value = decInput.value;
      lastBrInput.value = null;
    });
    watch(decInput, async (val) => {
      if (!selectedRadix.value || val == lastDecInput.value) return;
      try {
        brInput.value = await brFromFloat(
          selectedRadix.value,
          val,
          precision.value
        );
      } catch (error) {
        console.error(error);
      }
      lastBrInput.value = brInput.value;
      lastDecInput.value = null;
    });

    return {
      radices,
      selectedRadix,
      loading,
      result,
      compute,
      query,
      brInput,
      decInput,
      precision,
    };
  },
});
</script>
