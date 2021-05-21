<template>
  <div @click="show = show == 2 ? 0 : show + 1">
    {{ show == 0 ? date : show == 1 ? ymd : jdn }}
  </div>
</template>

<script lang="ts">
import { jdnToYmd } from "@/kanon-api";
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
      show: 0,
      date: "",
      ymd: "",
    };
  },
  created() {
    jdnToYmd("Julian A.D.", this.jdn).then((res) => {
      this.date = res.date;
      this.ymd = res.ymd.join("/");
    });
  },
});
</script>
