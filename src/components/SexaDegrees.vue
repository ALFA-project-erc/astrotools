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
  },
  data() {
    return {
      showSexa: true,
      sexagesimal: "",
      degrees: "",
    };
  },
  watch: {
    value: {
      immediate: true,
      async handler(newVal: Promise<string>) {
        const val = await Promise.resolve(newVal);
        const parts = val.replaceAll(" ", "").split(";");
        const intParts = parts[0].split(",");
        const floatParts = parts[1].split(",");
        let value = Number.parseInt(intParts[0]);

        if (intParts.length > 1)
          value = value * 60 + Number.parseInt(intParts[1]);

        for (let i = 0; i < floatParts.length; i++) {
          value += Number.parseInt(floatParts[i]) / 60 ** (i + 1);
        }

        this.degrees = value.toFixed(2) + "°";
        intParts[intParts.length - 1] =
          intParts[intParts.length - 1].padStart(2, "0") + "°";
        if (intParts.length > 1) {
          intParts[0] = intParts[0].padStart(2, "0") + "s";
        }
        for (let i = 0; i < floatParts.length; i++) {
          floatParts[i] = floatParts[i].padStart(2, "0");
          floatParts[i] += "'".repeat(i + 1);
        }
        this.sexagesimal = intParts.join("") + " ; " + floatParts.join("");
      },
    },
  },
});
</script>
