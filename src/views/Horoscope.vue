<template>
  <q-card class="my-card">
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
    <div class="row">
      <q-card-section class="row">
        <q-card-section class="col">
          <PositionDisplay
            :loading="loading < 8"
            :planetPositions="positionParts[0]"
          />
        </q-card-section>
        <q-card-section class="col">
          <PositionDisplay
            :loading="loading < 8"
            :planetPositions="positionParts[1]"
          />
        </q-card-section>
        <q-card-section class="col">
          <q-list dense>
            <q-item-label header>Houses</q-item-label>
            <q-item clickable v-for="(house, idx) in houses" :key="house">
              <q-item-section avatar>
                {{ idx + 1 }}
              </q-item-section>

              <q-item-section>
                <SexaDegrees :value="house" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card-section>
    </div>
    <q-card-section>
      <q-item clickable class="q-mx-md">
        <q-item-section avatar>
          <q-icon color="primary" name="img:svg/ascendant.svg" />
        </q-item-section>

        <q-item-section>
          <q-item-label> Ascendant </q-item-label>
          <q-item-label caption v-if="houses.length > 0 && loading == 8">
            <SexaDegrees
              :value="houses[0]"
              v-if="houses[0] && houses[0] !== 'ERROR'"
            />
            <div v-else style="color: red">
              {{ houses[0] }}
            </div>
          </q-item-label>
          <q-skeleton type="text" v-else square height="18px" />
        </q-item-section>
      </q-item>
    </q-card-section>
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

<script lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import PositionDisplay from "@/components/PositionDisplay.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { Planet } from "@/enums";
import { DateParams, getHouses, getTruePosition, jdnToDate } from "@/kanon-api";
import { fracToHM } from "@/utils";
import { computed, defineComponent, reactive, ref } from "vue";

export default defineComponent({
  name: "Horoscope",
  components: { DatePicker, PositionDisplay, SexaDegrees },
  setup() {
    const positions = ref(new Map<Planet, string>());
    Object.values(Planet).forEach((planet) => {
      positions.value.set(planet, "");
    });
    const houses = ref<string[]>([]);
    const loading = ref(8);

    const dateRepr = ref("");
    const longitude = reactive({ degrees: 2, minutes: 21 });
    const latitude = reactive({ degrees: 48, minutes: 51 });

    const coordinates = ref("");

    const convertFloat = (sexa: { degrees: number; minutes: number }) =>
      (Math.abs(sexa.degrees) + sexa.minutes / 60) * Math.sign(sexa.degrees);

    const positionParts = computed(() => {
      const arr = Array.from(positions.value)
        .sort()
        .map((entry) => ({
          planet: entry[0],
          position: entry[1],
        }));
      const half = Math.ceil(arr.length / 2);
      return [arr.splice(0, half), arr.splice(-half)];
    });

    const onSubmit = async (
      event: {
        date: string;
        jdn: number;
      } & DateParams
    ) => {
      const { date } = event;
      loading.value = 0;
      dateRepr.value = date;

      coordinates.value = `φ ${latitude.degrees}°${latitude.minutes
        .toString()
        .padStart(2, "0")
        .toString()
        .padStart(2, "0")}" λ ${longitude.degrees}°${longitude.minutes
        .toString()
        .padStart(2, "0")} `;

      const trueDate = await jdnToDate(
        "Julian A.D.",
        event.jdn +
          (convertFloat(longitude) -
            convertFloat({ degrees: -4, minutes: 1 })) /
            360
      );

      const [year, month, day] = trueDate.ymd;

      const { hours, minutes } = fracToHM(trueDate.frac);

      const housesPromise = getHouses(
        { day, month, year, hours, minutes },
        convertFloat(latitude)
      );
      const allPromises = Promise.all(
        Object.values(Planet).map(async (planet) => {
          try {
            positions.value.set(
              planet,
              await getTruePosition(planet, {
                day,
                month,
                year,
                hours,
                minutes,
              })
            );
          } catch (error) {
            positions.value.set(planet, "ERROR");
          }
          loading.value += 1;
        })
      );
      try {
        houses.value = await housesPromise;
        loading.value += 1;
      } catch (error) {
        houses.value = ["ERROR"];
      }
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
    return {
      positions,
      houses,
      loading,
      jdnToday,
      longitude,
      latitude,
      coordinates,
      onSubmit,
      positionParts,
      dateParts: computed(() => dateRepr.value.split(" in Julian ")),
    };
  },
});
</script>

<style lang="sass" scoped>
.my-card
  display: inline-block
</style>
