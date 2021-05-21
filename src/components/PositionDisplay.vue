<template>
  <q-list>
    <q-item clickable v-for="pp in planetPositions" :key="pp.planet">
      <q-item-section avatar>
        <q-icon color="primary" name="brightness_7" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ capitalize(pp.planet) }}</q-item-label>
        <q-item-label caption v-if="!loading">
          <SexaDegrees
            :value="pp.position"
            v-if="pp.position && pp.position !== 'ERROR'"
          />
          <div v-else style="color: red">
            {{ pp.position }}
          </div>
        </q-item-label>
        <q-skeleton type="text" v-else square height="18px" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent, capitalize } from "vue";
import SexaDegrees from "./SexaDegrees.vue";

export default defineComponent({
  components: { SexaDegrees },
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
    capitalize,
  },
});
</script>
