<template>
  <q-card>
    <q-card-section>
      <q-select
        v-model="selectedRadix"
        filled
        :options="radices"
        label="Numerical base"
      />
    </q-card-section>
    <q-separator />
    <q-card-section horizontal class="q-px-md q-pb-md">
      <q-card-section class="col-6 q-gutter-md">
        <div class="text-subtitle1">Arithmetic operations</div>
        <q-input v-model="query" label="Query" filled maxlength="40" />
        <div class="row">
          <q-btn
            type="submit"
            label="Compute"
            color="primary"
            :loading="loading"
            :disable="!query"
            @click="compute"
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
              v-model="brInput"
              :label="selectedRadix"
              filled
              debounce="500"
              maxlength="40"
            />
            <q-input
              v-model.number="precision"
              label="Precision"
              type="number"
              dense
              filled
              max="10"
              min="0"
            />
          </div>
          <q-input
            v-model.number="decInput"
            label="Decimal"
            debounce="500"
            type="number"
            filled
          />
        </div>
      </q-card-section>
    </q-card-section>
    <q-card-section v-if="history.length > 0">
      <q-markup-table flat bordered>
        <thead>
          <tr>
            <th class="text-left">Query</th>
            <th class="text-right">Value</th>
            <th class="text-right">Remainder</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(h, i) in history" :key="i">
            <td class="text-left">{{ h.query }}</td>
            <td class="text-right">{{ h.result.value }}</td>
            <td class="text-right">{{ h.result.remainder }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {
  BasedRealResponse,
  brFromFloat,
  brToFloat,
  getCalcCompute,
  getOpenAPISchema,
} from "@/kanon-api";
import { onMounted, ref, watch } from "vue";

const radices = ref<string[]>([]);
const selectedRadix = ref<string | undefined>(undefined);

onMounted(async () => {
  radices.value = (
    await getOpenAPISchema()
  ).components.schemas.SupportedRadices.enum;
  selectedRadix.value = radices.value[0];
});

const loading = ref(false);
const result = ref<BasedRealResponse>({ value: "", remainder: "" });
const query = ref<string>("");

const history = ref<{ query: string; result: BasedRealResponse }[]>([]);

const compute = async () => {
  if (!selectedRadix.value || !query.value) return;
  loading.value = true;
  try {
    result.value = await getCalcCompute(query.value, selectedRadix.value);
    history.value.push({ query: query.value, result: result.value });
  } catch (error) {
    result.value.value =
      (error as { response?: { data?: { detail: string } } }).response?.data
        ?.detail ?? "";
    result.value.remainder = "";
  }
  loading.value = false;
};

const brInput = ref("00 ; 00, 00");
const lastBrInput = ref<string | undefined>(undefined);
const decInput = ref(0);
const lastDecInput = ref<number | undefined>(undefined);
const precision = ref(2);

watch(brInput, async (val) => {
  if (!selectedRadix.value || val == lastBrInput.value) return;
  try {
    decInput.value = await brToFloat(selectedRadix.value, val);
  } catch (error) {
    console.error(error);
  }
  lastDecInput.value = decInput.value;
  lastBrInput.value = undefined;
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
  lastDecInput.value = undefined;
});
</script>
