<template>
  <div class="q-pa-md">
    <q-stepper keep-alive v-model="step" color="primary" animated>
      <q-step
        :name="1"
        title="Celestial body"
        :caption="step1Caption"
        icon="settings"
        :done="planet && step > 1"
      >
        Select your celestial body.

        <q-select
          :options="cBodies"
          :option-label="capitalize"
          v-model="planet"
        >
        </q-select>

        <q-stepper-navigation>
          <q-btn
            :disable="planet === null"
            @click="step = 2"
            color="primary"
            label="Continue"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        title="Starting date"
        :caption="step2Caption"
        icon="create_new_folder"
        :done="date !== null"
        :disable="!planet"
      >
        Select your starting date.

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
        :caption="step3Caption"
        icon="assignment"
        :done="positionData.length > 0"
        :disable="!planet || !date"
      >
        <div>
          Select the number of values and steps.
          <div class="row">
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
          </q-stepper-navigation>
        </div>
      </q-step>
    </q-stepper>

    <q-markup-table>
      <thead>
        <tr>
          <th class="text-left">Date</th>
          <th class="text-right">Historical</th>
          <th class="text-right">IMCCE</th>
          <th class="text-right">Difference</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="posData in positionData" :key="posData.jdn">
          <td class="text-left"><JdnJulianDate :jdn="posData.jdn" /></td>
          <td class="text-right"><SexaDegrees :value="posData.position" /></td>
          <td class="text-right">
            <SexaDegrees
              :v-if="posData.imcce !== undefined"
              :value="posData.imcce"
            />
          </td>
          <td class="text-right">
            <SexaDegrees
              :v-if="posData.diff !== undefined"
              :value="posData.diff"
            />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-btn
      @click="exportCSV()"
      fab
      icon="add"
      color="primary"
      v-if="positionData.length > 0"
    />
  </q-page-sticky>
</template>

<script lang="ts">
import JdnJulianDate from "@/components/JdnJulianDate.vue";
import DatePicker from "@/components/DatePicker.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { Planet } from "@/enums";
import { EphemeridesResponse, getEphemerides, YMD } from "@/kanon-api";
import { capitalize, defineComponent, ref } from "vue";

export default defineComponent({
  components: { DatePicker, SexaDegrees, JdnJulianDate },
  data() {
    return {
      cBodies: Object.values(Planet),
      planet: ref<Planet | null>(null),
      date: ref<YMD | null>(null),
      nValRef: ref(1),
      valStepRef: ref(1),
      step: ref(1),
      positionData: ref<EphemeridesResponse>([]),
      loading: false,
    };
  },
  methods: {
    async onCompute(): Promise<void> {
      if (this.planet && this.date) {
        this.loading = true;
        try {
          this.positionData = await getEphemerides(
            this.planet,
            this.date,
            this.nVal,
            this.valStep
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
        "date,position\n" +
        this.positionData.map((v) => `${v.jdn},"${v.position}"`).join("\n");
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
    step1Caption() {
      let base = "";
      if (this.planet) base += `${capitalize(this.planet)}`;
      return base;
    },
    step2Caption() {
      let base = "";
      if (this.date !== null) {
        base += `${this.date.year}/${this.date.month}/${this.date.day}`;
      }
      return base;
    },
    step3Caption() {
      let base = "";
      base += `Values : ${this.nVal} | Step : ${this.valStep}`;
      return base;
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
