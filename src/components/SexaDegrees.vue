<template>
  <div @click="showSexa = !showSexa">
    {{ showSexa ? sexagesimal : degrees }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SEXA_REGEX } from "@/utils";

export default defineComponent({
  name: "SexaDegrees",
  props: {
    value: {
      type: String,
      required: true,
      validator: (val: string) => {
        return SEXA_REGEX.test(val) && val.split(";")[0].split(",").length <= 2;
      },
    },
  },
  data() {
    return {
      showSexa: true,
    };
  },
  computed: {
    sexagesimal(): string {
      const parts = this.value.split(";");
      const intParts = parts[0].trim().split(",");
      const floatParts = parts[1].trim().split(",");
      intParts[intParts.length - 1] += "°";
      if (intParts.length > 1) {
        intParts[0] += "s";
      }
      for (let i = 0; i < floatParts.length; i++) {
        floatParts[i] += "'".repeat(i + 1);
      }
      return intParts.join("") + " ; " + floatParts.join("");
    },
    degrees(): string {
      const parts = this.value.split(";");
      const intParts = parts[0].split(",");
      const floatParts = parts[1].split(",");

      let value = Number.parseInt(intParts[0]);

      if (intParts.length > 1)
        value = value * 60 + Number.parseInt(intParts[1]);

      for (let i = 0; i < floatParts.length; i++) {
        value += Number.parseInt(floatParts[i]) / 60 ** (i + 1);
      }

      return value.toFixed(2) + "°";
    },
  },
});
</script>
