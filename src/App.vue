<template>
  <q-layout view="hHh lpR fFf">
    <q-drawer show-if-above side="left" bordered> <VerticalTab /> </q-drawer>

    <q-page-container class="margin">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <div class="q-pa-md">
            <component :is="Component" />
          </div>
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import VerticalTab from "./components/VerticalTab.vue";

export default {
  name: "LayoutDefault",

  components: {
    VerticalTab,
  },
};
</script>

<style>
.q-page-container.margin {
  padding: 10px;
}
</style>
