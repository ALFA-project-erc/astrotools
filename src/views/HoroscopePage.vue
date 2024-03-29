<template>
  <q-card class="horoscope-card">
    <!-- Header -->
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
    <q-card-section>
      <div class="row q-px-md">
        <div class="col-12">
          <q-select
            v-model="selectedTableSet"
            :option-label="snakeCaseToTitleCase"
            label="Table Set"
            :options="tableSets"
          />
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <!-- Planets -->
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
    <!-- Ascendant/House -->
    <q-card-section>
      <div class="row">
        <div class="col-xs-12 col-sm-7 col-md-7">
          <q-expansion-item class="q-mx-md" expand-icon-toggle>
            <template #header>
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
        </div>
        <div class="col-xs-12 col-sm-5 col-md-5">
          <q-select
            v-model="selectedHouseMethod"
            label="House Calculation Method"
            :options="houseMethods"
          />
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <!-- Ltd/Lng -->
    <q-card-section class="row q-gutter-md justify-center">
      <div class="col-auto">
        <div class="text-overline">Latitude</div>
        <div class="row">
          <q-input
            v-model.number="latitude.degrees"
            label="Degrees"
            filled
            min="16"
            max="48"
            type="number"
          />
          <q-input
            v-model.number="latitude.minutes"
            label="Minutes"
            filled
            min="0"
            max="59"
            type="number"
          />
        </div>
      </div>
      <div class="col-auto">
        <div class="text-overline">Longitude</div>
        <div class="row">
          <q-input
            v-model.number="longitude.degrees"
            label="Degrees"
            filled
            min="-179"
            max="180"
            type="number"
          />
          <q-input
            v-model.number="longitude.minutes"
            label="Minutes"
            filled
            min="0"
            max="59"
            type="number"
          />
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="center">
      <DatePicker
        v-if="selectedHouseMethod"
        :loading="loading < 8"
        :percentage="(loading / 8) * 100"
        :max-days="31"
        :max-month="12"
        :starting-jdn="jdnToday"
        calendar="Julian A.D."
        with-time
        @submit="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import PositionDisplay from "@/components/PositionDisplay.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { Planet } from "@/enums";
import {
  DateParams,
  getHouses,
  getOpenAPISchema,
  getTruePosition,
} from "@/kanon-api";
import {
  convertFloat,
  pad2,
  retrieveFromPromise,
  snakeCaseToTitleCase,
} from "@/utils";
import { computed, onMounted, reactive, ref } from "vue";

const positions = ref(
  Object.values(Planet).map((p) => ({ planet: p, position: "" }))
);

const houseMethods = ref<string[]>([]);
const selectedHouseMethod = ref<string>("");
const tableSets = ref<string[]>([]);
const selectedTableSet = ref<string>("");

onMounted(async () => {
  const schemas = (await getOpenAPISchema()).components.schemas;
  houseMethods.value = schemas.HouseMethods.enum;
  selectedHouseMethod.value = houseMethods.value[1];
  tableSets.value = schemas.TableSets.enum;
  selectedTableSet.value = tableSets.value[0];
});

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

  const housesPromise = getHouses(
    selectedTableSet.value,
    dateParams,
    convertFloat(latitude),
    selectedHouseMethod.value
  );
  const allPromises = Promise.all(
    positions.value.map(async ({ planet }, idx) => {
      positions.value[idx] = {
        planet: planet,
        position: await retrieveFromPromise(
          getTruePosition(selectedTableSet.value, planet, dateParams),
          "ERROR"
        ),
      };
      loading.value += 1;
    })
  );
  houses.value = await retrieveFromPromise(housesPromise, ["ERROR"]);
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
