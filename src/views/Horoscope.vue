<template>
  <q-card class="horoscope-card">
    <q-card-section>
      <div class="row q-px-md">
        <div class="text-h6 col">Horoscope</div>
        <div class="text-caption col">
          <div>{{ dateParts[0] }}</div>
          <div class="row">
            <div class="col-6">{{ dateParts[1] }}</div>
            <div class="col-6 text-right">
              {{ coordinates }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="row q-px-xl q-pt-lg">
      <q-item
        v-for="pp in positions"
        :key="pp.planet"
        class="col-xs-12 col-sm-6 col-md-6 q-px-none q-py-none"
      >
        <PositionDisplay
          :loading="loading < 8"
          :position="pp.position"
          :name="pp.planet"
        />
      </q-item>
    </q-card-section>
    <q-card-section>
      <q-expansion-item class="q-mx-md" expand-icon-toggle>
        <template v-slot:header>
          <PositionDisplay
            :loading="false"
            :position="houses[0]"
            name="ascendant"
          />
          <q-item-section class="col-1"> </q-item-section>
        </template>
        <q-card-section class="q-pt-none">
          <q-list dense>
            <template v-for="(house, idx) in houses" :key="house">
              <q-item v-if="idx > 0">
                <q-item-section class="col-1">
                  <q-item-label overline>
                    {{ idx + 1 }}
                  </q-item-label>
                </q-item-section>
                <q-item-section class="col-shrink">
                  <q-item-label caption>
                    <SexaDegrees :value="house" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card-section>
      </q-expansion-item>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-item class="q-mx-md justify-center">
        <q-item-section class="col-auto">
          <div class="text-overline">Latitude</div>
          <div class="row">
            <q-input
              label="Degrees"
              v-model.number="latitude.degrees"
              filled
              min="16"
              max="48"
              type="number"
            />
            <q-input
              label="Minutes"
              v-model.number="latitude.minutes"
              filled
              min="0"
              max="59"
              type="number"
            />
          </div>
        </q-item-section>
        <q-item-section class="col-auto">
          <div class="text-overline">Longitude</div>
          <div class="row">
            <q-input
              label="Degrees"
              v-model.number="longitude.degrees"
              filled
              min="-179"
              max="180"
              type="number"
            />
            <q-input
              label="Minutes"
              v-model.number="longitude.minutes"
              filled
              min="0"
              max="59"
              type="number"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-actions align="center">
      <DatePicker
        :loading="loading < 8"
        :percentage="(loading / 8) * 100"
        :maxDays="31"
        :maxMonth="12"
        :startingJdn="jdnToday"
        calendar="Julian A.D."
        @submit="onSubmit"
        withTime
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import PositionDisplay from "@/components/PositionDisplay.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { Planet } from "@/enums";
import { DateParams, getHouses, getTruePosition } from "@/kanon-api";
import { convertFloat, pad2 } from "@/utils";
import { computed, reactive, ref } from "vue";

const positions = ref(
  Object.values(Planet).map((p) => ({ planet: p, position: "" }))
);

const houses = ref<string[]>([""]);
const loading = ref(8);

const dateRepr = ref("");
const longitude = reactive({ degrees: 2, minutes: 21 });
const latitude = reactive({ degrees: 48, minutes: 51 });

const coordinates = ref("");

const onSubmit = async (
  event: {
    date: string;
    jdn: number;
  } & DateParams
) => {
  const { date, year, month, day, minutes, hours } = event;
  loading.value = 0;
  dateRepr.value = date;

  coordinates.value =
    `φ ${latitude.degrees}°${pad2(latitude.minutes)}" ` +
    `λ ${longitude.degrees}°${pad2(longitude.minutes)}`;

  const dateParams: DateParams = { day, month, year, hours, minutes };

  const housesPromise = getHouses(dateParams, convertFloat(latitude));
  const allPromises = Promise.all(
    positions.value.map(async ({ planet }, idx) => {
      let mess: string;
      try {
        mess = await getTruePosition(planet, dateParams);
      } catch (error) {
        mess = "ERROR";
      }
      positions.value[idx] = { planet: planet, position: mess };
      loading.value += 1;
    })
  );
  try {
    houses.value = await housesPromise;
  } catch (error) {
    houses.value = ["ERROR"];
  }
  loading.value += 1;
  await allPromises;
  loading.value = 8;
};
const date = new Date();
const jdnToday = Number.parseFloat(
  (
    date.getTime() / 86400000 +
    2440587.5 -
    date.getTimezoneOffset() / 1440
  ).toFixed(3)
);
const dateParts = computed(() => dateRepr.value.split(" in Julian "));
</script>

<style lang="sass" scoped>
.horoscope-card
  display: inline-block
  max-width: 33rem
</style>
