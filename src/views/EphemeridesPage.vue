<template>
  <q-stepper v-model="step" keep-alive color="primary" animated>
    <q-step
      :name="1"
      title="Celestial body"
      :caption="stepCaptions[0]"
      icon="flare"
      :done="!!selectedTableSet && step > 1"
      class="q-pa-sm row"
    >
      <div class="text-subtitle1 q-pb-md">Select a table set :</div>

      <div class="col-4">
        <q-select
          v-model="selectedTableSet"
          :option-label="snakeCaseToTitleCase"
          label="Table Set"
          :options="tableSets"
        />
      </div>

      <q-stepper-navigation>
        <q-btn
          :disable="!selectedTableSet"
          color="primary"
          label="Continue"
          @click="step = 2"
        />
      </q-stepper-navigation>
    </q-step>
    <q-step
      :name="2"
      title="Celestial body"
      :caption="stepCaptions[1]"
      icon="flare"
      :done="planet.length > 0 && step > 2"
      class="q-pa-sm row"
    >
      <div class="text-subtitle1 q-pb-md">
        Select one or more celestial bodies :
      </div>

      <div class="col-4">
        <q-select
          v-model="planet"
          filled
          :options="cBodies"
          :option-label="capitalize"
          multiple
          clearable
          @clear="planet = []"
        />
      </div>

      <q-stepper-navigation>
        <q-btn
          :disable="planet.length === 0"
          color="primary"
          label="Continue"
          @click="step = 3"
        />
        <q-btn
          flat
          color="primary"
          label="Back"
          class="q-ml-sm"
          @click="step = 1"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step
      :name="3"
      title="Starting date"
      :caption="stepCaptions[2]"
      icon="today"
      :done="date !== undefined"
      :disable="!planet"
      class="q-pa-sm"
    >
      <div class="text-subtitle1 q-pb-md">Select a starting date :</div>

      <DatePicker
        :max-days="31"
        :max-month="12"
        calendar="Julian A.D."
        @submit="date = $event"
      />

      <q-stepper-navigation>
        <q-btn
          :disable="date === undefined"
          color="primary"
          label="Continue"
          @click="step = 4"
        />
        <q-btn
          flat
          color="primary"
          label="Back"
          class="q-ml-sm"
          @click="step = 2"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step
      :name="4"
      title="Options"
      :caption="stepCaptions[3]"
      icon="assignment"
      :done="positionData.length > 0"
      :disable="!planet || !date"
      class="q-pa-sm"
    >
      <div>
        <div class="text-subtitle1 q-pb-md">
          Select the number of values and steps :
        </div>
        <div class="row q-gutter-md">
          <q-input
            v-model.number="nVal"
            label="Number of values"
            type="number"
            filled
            min="1"
            :rules="[(val: any) => val >= 1 || 'Invalid']"
          />
          <q-input
            v-model.number="valStep"
            label="Step"
            type="number"
            filled
            min="1"
            :rules="[(val: any) => val >= 1 || 'Invalid']"
          />
          <q-checkbox v-model="imcceToggle" left-label label="IMCCE Data" />
        </div>
        <q-stepper-navigation>
          <q-btn
            :disable="step === undefined || nVal === undefined"
            color="primary"
            label="Compute"
            :loading="loading"
            @click="onCompute"
          />
          <q-btn
            flat
            color="primary"
            label="Back"
            class="q-ml-sm"
            @click="step = 3"
          />
          <q-btn
            flat
            label="export"
            icon="file_download"
            color="secondary"
            :disable="positionData.length == 0"
            @click="exportCSV()"
          />
        </q-stepper-navigation>
      </div>
    </q-step>
  </q-stepper>
  <PlanetPositionTable :data="positionData" />
</template>

<script setup lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import PlanetPositionTable from "@/components/PlanetPositionTable.vue";
import { Planet } from "@/enums";
import {
  EphemeridesResponse,
  getEphemerides,
  DateParams,
  getOpenAPISchema,
} from "@/kanon-api";
import { snakeCaseToTitleCase } from "@/utils";
import { capitalize, computed, onMounted, ref } from "vue";

export type EphemeridesInfo = {
  positions: EphemeridesResponse;
  planet: Planet;
};

const cBodies = Object.values(Planet);
const planet = ref<Planet[]>([]);
const date = ref<DateParams | undefined>(undefined);
const nValRef = ref(1);
const valStepRef = ref(1);
const step = ref(1);
const positionData = ref<EphemeridesInfo[]>([]);
const loading = ref(false);
const imcceToggle = ref(false);

const tableSets = ref<string[]>([]);
const selectedTableSet = ref<string>("");

onMounted(async () => {
  const schemas = (await getOpenAPISchema()).components.schemas;
  tableSets.value = schemas.TableSets.enum;
  selectedTableSet.value = tableSets.value[0];
});

const valStep = computed({
  get(): number {
    return valStepRef.value;
  },
  set(val: number) {
    if (val >= 1) valStepRef.value = val;
  },
});
const nVal = computed({
  get(): number {
    return nValRef.value;
  },
  set(val: number) {
    if (val >= 1) nValRef.value = val;
  },
});
const onCompute = async (): Promise<void> => {
  if (planet.value.length > 0 && date.value) {
    loading.value = true;
    const sDate = date.value;
    try {
      positionData.value = await Promise.all(
        planet.value.map(async (p) => ({
          positions: await getEphemerides(
            selectedTableSet.value,
            p,
            sDate,
            nVal.value,
            valStep.value,
            imcceToggle.value
          ),
          planet: p,
        }))
      );
    } catch (error) {
      positionData.value = [];
    }
    loading.value = false;
  }
};
const exportCSV = () => {
  const csv =
    `date,${positionData.value.map((p) => p.planet).join(",")}\n` +
    positionData.value[0].positions
      .map(
        (v, idx) =>
          `${v.jdn},"${positionData.value
            .map((p) => p.positions[idx].position)
            .join('","')}"`
      )
      .join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ephemerides_${date.value?.year}${date.value?.month}${
    date.value?.day
  }_${nVal.value}_${valStep.value}_${positionData.value
    .map((p) => p.planet)
    .join("_")}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
const stepCaptions = computed(() => [
  snakeCaseToTitleCase(selectedTableSet.value),
  planet.value.length == 0
    ? ""
    : `${planet.value.map(capitalize).sort().join(", ")}`,
  date.value === undefined
    ? ""
    : `${date.value.year}/${date.value.month
        .toString()
        .padStart(2, "0")}/${date.value.day.toString().padStart(2, "0")}`,
  `Values : ${nVal.value} | Step : ${valStep.value}`,
]);
</script>
