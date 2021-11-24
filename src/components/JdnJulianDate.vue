<template>
  <div @click="show = show == 2 ? 0 : show + 1">
    {{ show == 0 ? date : show == 1 ? ymd : jdn }}
  </div>
</template>

<script setup lang="ts">
import { jdnToDate } from "@/kanon-api";
import { ref, watch, defineProps, withDefaults } from "vue";
const props = withDefaults(
  defineProps<{
    jdn: number;
    showProp?: number;
  }>(),
  { showProp: 1 }
);

const show = ref(props.showProp);
const date = ref("");
const ymd = ref("");

watch(
  () => props.showProp,
  (val: number) => {
    show.value = val;
  },
  { immediate: true }
);
watch(
  () => props.jdn,
  async (val: number) => {
    try {
      const res = await jdnToDate("Julian A.D.", val);
      date.value = res.date;
      ymd.value =
        res.ymd[0].toString() +
        "/" +
        res.ymd
          .slice(1, 3)
          .map((v) => v.toString().padStart(2, "0"))
          .join("/");
    } catch (error) {
      date.value = "";
      ymd.value = "";
    }
  },
  { immediate: true }
);
</script>
