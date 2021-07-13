<template>
  <q-card class="my-card">
    <q-card-section>
      <div class="text-h6">Horoscope {{ date }}</div>
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
          <q-item-label caption v-if="loading == 8">
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
        <q-item-section side class="col-3">
          <q-input
            label="Latitude"
            v-model.number="latitude"
            filled
            type="number"
            suffix="°"
          />
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
      />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import PositionDisplay from "@/components/PositionDisplay.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { Planet } from "@/enums";
import { getAscendant, getTruePosition } from "@/kanon-api";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "Horoscope",
  components: { DatePicker, PositionDisplay, SexaDegrees },
  data() {
    const positions = new Map<Planet, string>();
    Object.values(Planet).forEach((planet) => {
      positions.set(planet, "");
    });
    const ascendant = ref("");
    const loading = 8;
    const jdnToday = Math.floor(new Date().getTime() / 86400000 + 2440587.5);
    return { positions, ascendant, loading, date: "", jdnToday, latitude: 40 };
  },
  methods: {
    async onSubmit(event: {
      day: number;
      month: number;
      year: number;
      date: string;
    }) {
      const { day, month, year, date } = event;
      this.loading = 0;
      this.date = date;
      const ascendantPromise = getAscendant(
        { day, month, year },
        this.latitude
      );
      const allPromises = Promise.all(
        Object.values(Planet).map(async (planet) => {
          try {
            this.positions.set(planet, await getTruePosition(planet, event));
          } catch (error) {
            this.positions.set(planet, "ERROR");
          }
          this.loading += 1;
        })
      );
      try {
        this.ascendant = await ascendantPromise;
        this.loading += 1;
      } catch (error) {
        this.ascendant = "ERROR";
      }
      await allPromises;
      this.loading = 8;
    },
  },
  computed: {
    positionParts(): [
      { planet: Planet; position: string }[],
      { planet: Planet; position: string }[]
    ] {
      const arr = Array.from(this.positions)
        .sort()
        .map((entry) => ({
          planet: entry[0],
          position: entry[1],
        }));
      const half = Math.ceil(arr.length / 2);
      return [arr.splice(0, half), arr.splice(-half)];
    },
  },
});
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 500px
</style>
