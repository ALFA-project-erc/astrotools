<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" vertical color="primary" animated header-nav>
      <q-step
        :name="1"
        :title="step1Title"
        icon="settings"
        :done="body && step > 1"
      >
        Select your celestial body.

        <q-select :options="cBodies" v-model="body"> </q-select>

        <q-stepper-navigation>
          <q-btn
            :disable="body === null"
            @click="step = 2"
            color="primary"
            label="Continue"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        :title="step2Title"
        icon="create_new_folder"
        :done="step > 2"
        :disable="!body"
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
        :title="step3Title"
        icon="assignment"
        :done="step > 3"
        :disable="!body || !date"
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

    <q-list>
      <q-item v-for="posData in positionData" :key="posData.jdn">
        {{ posData.jdn }} : <SexaDegrees :value="posData.position" />
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import JulianDatePicker from "@/components/JulianDatePicker.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { Planet } from "@/enums";
import { getEphemerides, YMD } from "@/kanon-api";
import { defineComponent, ref } from "vue";

export default defineComponent({
  components: { JulianDatePicker, SexaDegrees },
  data() {
    return {
      cBodies: ["Sun", "Moon", "Mars", "Venus", "Mercury", "Jupiter", "Saturn"],
      body: ref<Planet | null>(null),
      date: ref<YMD | null>(null),
      nValRef: ref(1),
      valStepRef: ref(1),
      step: ref(1),
      positionData: ref<{ jdn: number; position: string }[]>([]),
    };
  },
  methods: {
    onCompute() {
      if (this.body && this.date)
        getEphemerides(this.body.toLowerCase() as Planet, this.date, this.nVal, this.valStep)
          .then((val) => (this.positionData = val))
          .catch((_) => (this.positionData = []));
    },
  },
  computed: {
    step1Title() {
      let base = "Celestial body";
      if (this.body !== null) {
        base += `: ${this.body}`;
      }
      return base;
    },
    step2Title() {
      let base = "Starting date";
      if (this.date !== null) {
        base += `: ${this.date.year}/${this.date.month}/${this.date.day}`;
      }
      return base;
    },
    step3Title() {
      let base = `Options: `;
      base += `Values (${this.valStep}) - Step (${this.nVal})`;
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
