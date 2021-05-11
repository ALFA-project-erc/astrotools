<template>
  <q-tabs vertical class="text-teal">
    <q-route-tab label="Home" icon="home" to="/" exact />
    <q-route-tab label="Horoscope" icon="brightness_4" to="/horoscope" exact />
    <q-route-tab label="Calculator" icon="calculate" to="/calculator" exact />
    <q-route-tab label="About" icon="help" to="/about" exact />
  </q-tabs>
</template>

<script lang="ts">
export default {
  name: "VerticalTab",
};
</script>
