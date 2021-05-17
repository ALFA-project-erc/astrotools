<template>
  <q-list>
    <q-item clickable v-for="pp in planetPositions" :key="pp.planet">
      <q-item-section avatar>
        <q-icon color="primary" name="brightness_7" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ camelCase(pp.planet) }}</q-item-label>
        <q-item-label caption v-if="!loading">{{ pp.position }}</q-item-label>
        <q-skeleton type="text" v-else square height="18px" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PositionDisplay",
  props: {
    planetPositions: {
      type: Object,
      validator: (props: { planet: string; position: string }[]) =>
        props.every((val) => "planet" in val && "position" in val),
    },
    loading: Boolean,
  },

  methods: {
    camelCase(val: string) {
      return val[0].toUpperCase() + val.slice(1).toLowerCase();
    },
  },
});
</script>
