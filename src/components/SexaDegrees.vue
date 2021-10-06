<template>
  <div @click="showSexa = !showSexa">
    {{ showSexa ? sexagesimal : degrees }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { sexaPretty, sexaToDecimal, SEXA_REGEX } from "@/utils";

export default defineComponent({
  name: "SexaDegrees",
  props: {
    value: {
      type: [String, Object],
      required: true,
      validator: (val: string | Promise<string>) => {
        if (typeof val === "string")
          return (
            SEXA_REGEX.test(val) && val.split(";")[0].split(",").length <= 2
          );
        return true;
      },
    },
    showSexaProp: { type: Boolean, default: true },
  },
  data() {
    return {
      showSexa: true,
      sexagesimal: "",
      degrees: "",
    };
  },
  watch: {
    showSexaProp: {
      immediate: true,
      handler(val) {
        this.showSexa = val;
      },
    },
    value: {
      immediate: true,
      async handler(newVal: Promise<string>) {
        const val = await Promise.resolve(newVal);

        const value = sexaToDecimal(val);
        this.degrees = value.toFixed(2) + "°";

        this.sexagesimal = sexaPretty(val);
      },
    },
  },
});
</script>

<style lang="sass" scoped>
div
  white-space: nowrap
  overflow: hidden
  cursor: pointer
</style>
