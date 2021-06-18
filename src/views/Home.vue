<template>
  <div class="q-gutter-xl">
    <div class="text-h2 text-center">Historical Tools for Astronomy</div>
    <div class="row q-gutter-xl justify-center">
      <q-card
        v-for="feat in featData"
        :key="feat"
        class="featcard text-white col-4"
        @click="routeTo(feat.name)"
      >
        <q-card-section>
          <q-item>
            <q-item-section avatar>
              <q-avatar font-size="30px" :icon="feat.icon" />
            </q-item-section>

            <q-item-section>
              <div class="text-h6">{{ feat.name }}</div>
              <div class="text-subtitle2">{{ feat.subtitle }}</div>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ feat.content }}
        </q-card-section>
      </q-card>
    </div>
    <div class="row justify-center q-gutter-xl">
      <q-btn class="col-1" icon="help" to="about" flat label="About" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

const data = [
  {
    name: "Horoscope",
    icon: "brightness_4",
    subtitle: "Find positions of all celestial bodies at a given time",
    content:
      "Compute a horoscope with all planets and the ascendant with historical methods. \
      Currently the only method available is with the Parisian Alphonsine Tables.",
  },
  {
    name: "Ephemerides",
    icon: "wb_sunny",
    subtitle: "List celestial bodies positions for a certain date range",
    content:
      "Display a list of positions from chosen celestial bodies with historical methods. \
      You can also compare the results with true positions computed by IMCCE. Currently the \
      only method available is with the Parisian Alphonsine Tables.",
  },
  {
    name: "Calculator",
    icon: "calculate",
    subtitle: "Make precise calculations with historical numerical bases",
    content:
      "Seamlessly convert historical bases (such as Sexagesimal) with decimal. \
      Do your own arithmetic operations on these numbers.",
  },
  {
    name: "Calendar",
    icon: "calendar_today",
    subtitle: "Convert dates between historical astronomical calendars",
    content:
      "Find information about all historical calendars used in the DISHAS project. \
      Use our converter to easily switch between calendars.",
  },
];

export default defineComponent({
  name: "Home",
  setup() {
    const router = useRouter();
    return {
      featData: data,
      routeTo: (name: string) => router.push({ name }),
    };
  },
  components: {},
});
</script>

<style scoped>
.featcard {
  min-width: 250px;
  cursor: pointer;
  background: radial-gradient(circle, #576db2 0%, #014a88 100%);
}
.featcard:hover {
  min-width: 250px;
  filter: brightness(95%);
}
</style>
