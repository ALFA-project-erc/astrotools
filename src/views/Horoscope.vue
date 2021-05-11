<template>
  <julian-date-picker></julian-date-picker>
</template>

<script lang="ts">
import JulianDatePicker from "@/components/JulianDatePicker.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Home",
  components: { JulianDatePicker },
});
</script>
