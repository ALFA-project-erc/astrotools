<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" color="primary" animated header-nav>
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
        :done="step > 2"
        :disable="!planet"
      >
        Select your starting date.

        <JulianDatePicker @submit="date = $event" />

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
      </q-step>
    </q-stepper>

    <q-list dense bordered padding class="rounded-borders">
      <div v-for="(posData, idx) in positionData" :key="posData.jdn">
        <q-item>
          <q-item-section side>
            <q-item-label>
              <JdnJulianDate :jdn="posData.jdn" />
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <SexaDegrees :value="posData.position" />
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator v-if="idx < positionData.length - 1" />
      </div>
    </q-list>
  </div>
</template>

<script lang="ts">
import JdnJulianDate from "@/components/JdnJulianDate.vue";
import JulianDatePicker from "@/components/JulianDatePicker.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { Planet } from "@/enums";
import { getEphemerides, YMD } from "@/kanon-api";
import { capitalize, defineComponent, ref } from "vue";

export default defineComponent({
  components: { JulianDatePicker, SexaDegrees, JdnJulianDate },
  data() {
    return {
      cBodies: Object.values(Planet),
      planet: ref<Planet | null>(null),
      date: ref<YMD | null>(null),
      nValRef: ref(1),
      valStepRef: ref(1),
      step: ref(1),
      positionData: ref<{ jdn: number; position: string }[]>([]),
      loading: false,
    };
  },
  methods: {
    onCompute() {
      if (this.planet && this.date) {
        this.loading = true;
        getEphemerides(this.planet, this.date, this.nVal, this.valStep)
          .then((val) => (this.positionData = val))
          .catch(() => (this.positionData = []))
          .finally(() => (this.loading = false));
      }
    },
    capitalize,
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
      base += `Values (${this.nVal}) - Step (${this.valStep})`;
      return base;
    },
    valStep: {
      get(): number {
        return this.valStepRef;
      },
      set(val) {
        if (val > 1) this.valStepRef = val;
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
