<template>
  <q-card class="my-card">
    <q-card-section>
      <div class="text-h6">Horoscope {{ dateRepr }}</div>
    </q-card-section>
    <q-separator />
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
    </q-card-section>
    <q-card-section>
      <q-item clickable class="q-mx-md">
        <q-item-section avatar>
          <q-icon color="primary" name="img:svg/ascendant.svg" />
        </q-item-section>

        <q-item-section>
          <q-item-label> Ascendant </q-item-label>
          <q-item-label caption v-if="ascendant && loading == 8">
            <SexaDegrees
              :value="ascendant"
              v-if="ascendant && ascendant !== 'ERROR'"
            />
            <div v-else style="color: red">
              {{ ascendant }}
            </div>
          </q-item-label>
          <q-skeleton type="text" v-else square height="18px" />
        </q-item-section>
        <q-item-section side class="col-6">
          <div class="row">
            <q-input
              label="Degrees"
              v-model.number="degrees"
              filled
              min="16"
              max="48"
              type="number"
            />
            <q-input
              label="Minutes"
              v-model.number="minutes"
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
import { DateParams, getAscendant, getTruePosition } from "@/kanon-api";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  name: "Horoscope",
  components: { DatePicker, PositionDisplay, SexaDegrees },
  setup() {
    const positions = ref(new Map<Planet, string>());
    Object.values(Planet).forEach((planet) => {
      positions.value.set(planet, "");
    });
    const ascendant = ref("");
    const loading = ref(8);

    const dateRepr = ref("");
    const degrees = ref(40);
    const minutes = ref(0);

    const latitude = computed(() => degrees.value + minutes.value / 60);

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
      const { day, month, year, hours, minutes, date } = event;
      loading.value = 0;
      dateRepr.value = date;
      const ascendantPromise = getAscendant(
        { day, month, year, hours, minutes },
        latitude.value
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
        ascendant.value = await ascendantPromise;
        loading.value += 1;
      } catch (error) {
        ascendant.value = "ERROR";
      }
      await allPromises;
      loading.value = 8;
    };
    const date = new Date();
    const jdnToday = (
      date.getTime() / 86400000 +
      2440587.5 -
      date.getTimezoneOffset() / 1440
    ).toFixed(3);
    return {
      positions,
      ascendant,
      loading,
      dateRepr,
      jdnToday,
      degrees,
      minutes,
      onSubmit,
      positionParts,
    };
  },
});
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 500px
</style>
