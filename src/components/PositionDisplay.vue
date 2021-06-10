<template>
  <q-list>
    <q-item clickable v-for="pp in planetPositions" :key="pp.planet">
      <q-item-section avatar>
        <q-icon
          :style="{
            'background-color': `${colors[pp.planet]}`,
            '-webkit-mask': `url(svg/${pp.planet}.svg) no-repeat center`,
            mask: `url(svg/${pp.planet}.svg) no-repeat center`,
          }"
          :color="pp.planet"
          :name="`img:svg/${pp.planet}.svg`"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ capitalize(pp.planet) }}</q-item-label>
        <q-item-label caption v-if="!loading && pp.position">
          <SexaDegrees
            :value="pp.position"
            v-if="pp.position && pp.position !== 'ERROR'"
          />
          <div v-else style="color: red">
            {{ pp.position }}
          </div>
        </q-item-label>
        <q-skeleton type="text" v-else square height="18px" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent, capitalize } from "vue";
import SexaDegrees from "./SexaDegrees.vue";

export default defineComponent({
  components: { SexaDegrees },
  name: "PositionDisplay",
  props: {
    planetPositions: {
      type: Object,
      validator: (props: { planet: string; position: string }[]) =>
        props.every((val) => "planet" in val && "position" in val),
    },
    loading: Boolean,
  },
  data() {
    return {
      colors: {
        sun: "rgb(255, 208, 0)",
        mercury: "rgb(194, 214, 60)",
        venus: "rgb(64, 204, 207)",
        moon: "rgb(44, 171, 230)",
        mars: "rgb(240,55,63)",
        jupiter: "rgb(255,87,51)",
        saturn: "rgb(230, 171, 34)",
      },
    };
  },
  methods: {
    capitalize,
  },
});
</script>
