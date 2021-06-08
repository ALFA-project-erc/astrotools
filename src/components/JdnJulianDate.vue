<template>
  <div @click="show = show == 2 ? 0 : show + 1">
    {{ show == 0 ? date : show == 1 ? ymd : jdn }}
  </div>
</template>

<script lang="ts">
import { jdnToDate } from "@/kanon-api";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    jdn: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      show: 1,
      date: "",
      ymd: "",
    };
  },
  watch: {
    jdn: {
      async handler(val) {
        try {
          const res = await jdnToDate("Julian A.D.", val);
          this.date = res.date;
          this.ymd =
            res.ymd[0].toString() +
            "/" +
            res.ymd
              .slice(1, 3)
              .map((v) => v.toString().padStart(2, "0"))
              .join("/");
        } catch (error) {
          this.date = "";
          this.ymd = "";
        }
      },
      immediate: true,
    },
  },
});
</script>
