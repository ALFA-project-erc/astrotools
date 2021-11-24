<template>
  <q-item-section avatar>
    <q-icon
      :style="{
        'background-color': `${colors[name]}`,
        '-webkit-mask': `url(svg/${name}.svg) no-repeat center`,
        mask: `url(svg/${name}.svg) no-repeat center`,
      }"
      :color="name"
      :name="`img:svg/${name}.svg`"
    />
  </q-item-section>

  <q-item-section class="col-shrink">
    <q-item-label>{{ capitalize(name) }}</q-item-label>
    <q-item-label caption v-if="!loading && position">
      <SexaDegrees :value="position" v-if="position && position !== 'ERROR'" />
      <div v-else style="color: red">
        {{ position }}
      </div>
    </q-item-label>
    <q-skeleton type="text" v-else square height="18px" width="5rem" />
  </q-item-section>
</template>

<script setup lang="ts">
import { Planet } from "@/enums";
import { defineProps, capitalize } from "vue";
import SexaDegrees from "./SexaDegrees.vue";

defineProps<{
  name: Planet | "ascendant";
  position: string;
  loading: boolean;
}>();
const colors = {
  sun: "rgb(255, 208, 0)",
  mercury: "rgb(194, 214, 60)",
  venus: "rgb(64, 204, 207)",
  moon: "rgb(44, 171, 230)",
  mars: "rgb(240,55,63)",
  jupiter: "rgb(255,87,51)",
  saturn: "rgb(230, 171, 34)",
  ascendant: "black",
};
</script>

<style lang="sass" scoped>
template
  display: inline-block
</style>
