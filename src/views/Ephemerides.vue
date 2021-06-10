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
      :done="date !== null"
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
          :disable="date === null"
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
            :rules="[(val) => val >= 1 || 'Invalid']"
          />
          <q-input
            label="Step"
            v-model.number="valStep"
            type="number"
            filled
            min="1"
            :rules="[(val) => val >= 1 || 'Invalid']"
          />
          <q-checkbox left-label v-model="imcceToggle" label="IMCCE Data" />
        </div>
        <q-stepper-navigation>
          <q-btn
            :disable="step === null || nVal === null"
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

<script lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import PlanetPositionTable from "@/components/PlanetPositionTable.vue";
import { Planet } from "@/enums";
import { EphemeridesResponse, getEphemerides, YMD } from "@/kanon-api";
import { capitalize, defineComponent, ref } from "vue";

export type EphemeridesInfo = {
  positions: EphemeridesResponse;
  planet: Planet;
};

export default defineComponent({
  components: { DatePicker, PlanetPositionTable },
  data() {
    return {
      cBodies: Object.values(Planet),
      planet: ref<Planet[]>([]),
      date: ref<YMD | null>(null),
      nValRef: ref(1),
      valStepRef: ref(1),
      step: ref(1),
      positionData: ref<EphemeridesInfo[]>([]),
      loading: false,
      imcceToggle: false,
    };
  },
  methods: {
    async onCompute(): Promise<void> {
      if (this.planet.length > 0 && this.date) {
        this.loading = true;
        const date = this.date;
        try {
          this.positionData = await Promise.all(
            this.planet.map(async (p) => ({
              positions: await getEphemerides(
                p,
                date,
                this.nVal,
                this.valStep,
                this.imcceToggle
              ),
              planet: p,
            }))
          );
        } catch (error) {
          this.positionData = [];
        }
        this.loading = false;
      }
    },
    capitalize,
    exportCSV() {
      const csv =
        `date,${this.positionData.map((p) => p.planet).join(",")}\n` +
        this.positionData[0].positions
          .map(
            (v, idx) =>
              `${v.jdn},"${this.positionData
                .map((p) => p.positions[idx].position)
                .join(",")}"`
          )
          .join("\n");
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "export";
      link.click();
      URL.revokeObjectURL(link.href);
    },
  },
  computed: {
    stepCaptions(): string[] {
      return [
        this.planet.length == 0
          ? ""
          : `${this.planet.map(capitalize).sort().join(", ")}`,
        this.date === null
          ? ""
          : `${this.date.year}/${this.date.month
              .toString()
              .padStart(2, "0")}/${this.date.day.toString().padStart(2, "0")}`,
        `Values : ${this.nVal} | Step : ${this.valStep}`,
      ];
    },
    valStep: {
      get(): number {
        return this.valStepRef;
      },
      set(val) {
        if (val >= 1) this.valStepRef = val;
      },
    },
    nVal: {
      get(): number {
        return this.nValRef;
      },
      set(val) {
        if (val >= 1) this.nValRef = val;
      },
    },
  },
});
</script>
