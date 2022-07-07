<template>
  <q-layout view="hHh lpR fFf">
    <q-drawer
      v-model="showDrawer"
      :breakpoint="10"
      :mini="mini"
      side="left"
      bordered
    >
      <VerticalTab :mini="mini" />
    </q-drawer>

    <q-page-container class="margin">
      <router-view v-slot="{ Component }">
        <div class="q-pa-md">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </div>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { watch } from "vue";
import VerticalTab from "./components/VerticalTab.vue";
import { RouteLocation, useRoute } from "vue-router";

const route = useRoute();
const showDrawer = ref(false);

const mini = ref(false);

const onWidthChange = () => (mini.value = window.innerWidth < 800);
onMounted(() => window.addEventListener("resize", onWidthChange));
onUnmounted(() => window.removeEventListener("resize", onWidthChange));

watch(
  route,
  (route: RouteLocation) => (showDrawer.value = route.name !== "Home")
);
</script>

<style>
.q-page-container.margin {
  padding: 10px;
}
</style>
