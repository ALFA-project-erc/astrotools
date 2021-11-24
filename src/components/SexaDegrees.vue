<template>
  <div @click="showSexa = !showSexa">
    {{ showSexa ? sexagesimal : degrees }}
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, withDefaults } from "vue";
import { sexaPretty, sexaToDecimal } from "@/utils";

const props = withDefaults(
  defineProps<{
    value: string;
    showSexaProp?: boolean;
  }>(),
  { showSexaProp: true }
);
const showSexa = ref(props.showSexaProp);
const sexagesimal = ref("");
const degrees = ref("");

watch(
  () => props.showSexaProp,
  (show: boolean) => {
    showSexa.value = show;
  },
  { immediate: true }
);

watch(
  () => props.value,
  (val: string) => {
    const value = sexaToDecimal(val);
    degrees.value = value.toFixed(2) + "°";

    sexagesimal.value = sexaPretty(val);
  },
  { immediate: true }
);
</script>

<style lang="sass" scoped>
div
  white-space: nowrap
  overflow: hidden
  cursor: pointer
</style>
