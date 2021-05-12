<template>
  <JulianDatePicker :disabled="loading" @submit="onSubmit" />
  <q-card class="my-card">
    <q-card-section>
      <div class="text-h6">Horoscope</div>
    </q-card-section>
    <q-card-section class="row">
      <q-card-section class="col">
        <PositionDisplay
          :loading="loading"
          :planetPositions="positionParts[0]"
        />
      </q-card-section>
      <q-card-section class="col">
        <PositionDisplay
          :loading="loading"
          :planetPositions="positionParts[1]"
        />
      </q-card-section>
    </q-card-section>
    <q-card-section>
      <q-item clickable>
        <q-item-section avatar>
          <q-icon color="primary" name="brightness_3" />
        </q-item-section>

        <q-item-section>
          <q-item-label> Ascendant </q-item-label>
          <q-item-label caption v-if="!loading">{{ ascendant }}</q-item-label>
          <q-skeleton type="text" v-else square height="18px" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import JulianDatePicker from "@/components/JulianDatePicker.vue";
import PositionDisplay from "@/components/PositionDisplay.vue";
import { Planet } from "@/enums";
import { getAscendant, getTruePosition } from "@/kanon-api";
import { defineComponent } from "vue";

const positions: { [p in Planet]: string } = {} as {
  [p in Planet]: string;
};
Object.values(Planet).forEach((planet) => {
  positions[planet] = "";
});
const ascendant = "";
const loading = false;

export default defineComponent({
  name: "Horoscope",
  components: { JulianDatePicker, PositionDisplay },
  data() {
    return { positions, ascendant, loading };
  },
  methods: {
    async onSubmit(event: { day: number; month: number; year: number }) {
      this.loading = true;
      const ascendantPromise = getAscendant(event);
      await Promise.all(
        Object.values(Planet).map(async (planet) => {
          try {
            this.positions[planet] = await getTruePosition(planet, event);
          } catch (error) {
            this.positions[planet] = "ERROR";
          }
        })
      );
      try {
        this.ascendant = await ascendantPromise;
      } catch (error) {
        this.ascendant = "ERROR";
      }
      this.loading = false;
    },
  },
  computed: {
    positionParts(): [
      { planet: string; position: string }[],
      { planet: string; position: string }[]
    ] {
      const arr = Object.entries(this.positions)
        .sort((a, b) => (a > b ? 1 : -1))
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
