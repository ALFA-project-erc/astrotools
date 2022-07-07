<template>
  <q-tabs vertical active-color="primary" class="text-secondary">
    <q-tab
      :label="mini ? '' : 'Home'"
      icon="home"
      exact
      @click="routeTo('Home')"
    />
    <q-route-tab
      :label="mini ? '' : 'Horoscope'"
      icon="brightness_4"
      to="/horoscope"
      exact
    />
    <q-route-tab
      :label="mini ? '' : 'Ephemerides'"
      icon="wb_sunny"
      to="/ephemerides"
      exact
    />
    <q-route-tab
      :label="mini ? '' : 'Calculator'"
      icon="calculate"
      to="/calculator"
      exact
    />
    <q-route-tab
      :label="mini ? '' : 'Calendar'"
      icon="calendar_today"
      to="/calendar"
      exact
    />
    <q-route-tab :label="mini ? '' : 'About'" icon="help" to="/about" exact />
  </q-tabs>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { useRouter } from "vue-router";
defineProps<{
  mini: boolean;
}>();
const router = useRouter();
const routeTo = (name: string) => router.push({ name });
</script>
