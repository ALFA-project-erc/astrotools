<template>
  <q-stepper keep-alive v-model="step" color="primary" animated>
    <q-step
      :name="1"
      title="Celestial body"
      :caption="stepCaptions[0]"
      icon="flare"
      :done="planet.length > 0 && step > 1"
      class="q-pa-sm row"
    >
      <div class="text-subtitle1 q-pb-md">
        Select one or more celestial bodies :
      </div>

      <div class="col-4">
        <q-select
          filled
          :options="cBodies"
          :option-label="capitalize"
          v-model="planet"
          multiple
          clearable
          @clear="planet = []"
        />
      </div>

      <q-stepper-navigation>
        <q-btn
          :disable="planet.length === 0"
          @click="step = 2"
          color="primary"
          label="Continue"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step
      :name="2"
      title="Starting date"
      :caption="stepCaptions[1]"
      icon="today"
      :done="date !== undefined"
      :disable="!planet"
      class="q-pa-sm"
    >
      <div class="text-subtitle1 q-pb-md">Select a starting date :</div>

      <DatePicker
        :maxDays="31"
        :maxMonth="12"
        calendar="Julian A.D."
        @submit="date = $event"
      />

      <q-stepper-navigation>
        <q-btn
          :disable="date === undefined"
          @click="step = 3"
          color="primary"
          label="Continue"
        />
        <q-btn
          flat
          @click="step = 1"
          color="primary"
          label="Back"
          class="q-ml-sm"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step
      :name="3"
      title="Options"
      :caption="stepCaptions[2]"
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
            label="Number of values"
            v-model.number="nVal"
            type="number"
            filled
            min="1"
            :rules="[(val: any) => val >= 1 || 'Invalid']"
          />
          <q-input
            label="Step"
            v-model.number="valStep"
            type="number"
            filled
            min="1"
            :rules="[(val: any) => val >= 1 || 'Invalid']"
          />
          <q-checkbox left-label v-model="imcceToggle" label="IMCCE Data" />
        </div>
        <q-stepper-navigation>
          <q-btn
            :disable="step === undefined || nVal === undefined"
            @click="onCompute"
            color="primary"
            label="Compute"
            :loading="loading"
          />
          <q-btn
            flat
            @click="step = 2"
            color="primary"
            label="Back"
            class="q-ml-sm"
          />
          <q-btn
            flat
            @click="exportCSV()"
            label="export"
            icon="file_download"
            color="secondary"
            :disable="positionData.length == 0"
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
import { EphemeridesResponse, getEphemerides, DateParams } from "@/kanon-api";
import { capitalize, computed, ref } from "vue";

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
