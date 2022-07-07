<template>
  <div class="row">
    <div class="q-pl-xs">
      <div class="text-h4">AstroTools v{{ version }}</div>
      <div class="text-subtitle1">
        Find the source code
        <a target="”_blank”" href="https://github.com/legau/astrotools">here</a
        >.
      </div>
      <q-separator />
      <div class="q-pt-md q-pr-md">
        <p>
          Please report any bugs or request features
          <a
            target="”_blank”"
            href="https://github.com/legau/astrotools/issues/new"
            >here</a
          >.
        </p>
        <p>
          Find the API documentation
          <a target="”_blank”" :href="api_url">here</a>.
        </p>
      </div>
    </div>
    <q-separator vertical />
    <q-list style="max-width: 400px" separator>
      <q-item-label header>Powered with</q-item-label>
      <q-item>
        <q-item-section avatar>
          <q-avatar square font-size="70px" size="70px">
            <img
              src="https://kanon.readthedocs.io/en/latest/_static/kanon-logo.png"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="q-pa-xs"> Kanon Python library </q-item-label>
          <q-item-label class="q-pa-xs"> Kanon API </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="text-grey-8 col q-py-md">
            <q-btn
              type="a"
              href="https://gitlab.obspm.fr/lgauffier/kanon"
              target="_blank"
              class="row"
              size="12px"
              flat
              dense
              round
              icon="open_in_new"
            />
            <q-btn
              type="a"
              href="https://github.com/legau/kanon-api"
              target="_blank"
              class="row"
              size="12px"
              flat
              dense
              round
              icon="open_in_new"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-avatar square font-size="70px" size="70px">
            <img
              id="dishas_logo"
              src="https://dishas.obspm.fr/logo/line_dishas.png"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="q-pa-sm"> DISHAS database </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="text-grey-8">
            <q-btn
              type="a"
              href="https://dishas.obspm.fr/"
              target="_blank"
              class="row"
              size="12px"
              flat
              dense
              round
              icon="open_in_new"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-avatar
            square
            style="filter: invert(1)"
            font-size="70px"
            size="70px"
            icon="img:https://www.imcce.fr/vues/img/logo_IMCCE.svg"
          >
          </q-avatar>
        </q-item-section>
        <q-item-section class="q-pa-sm">
          IMCCE positional ephemerides API
        </q-item-section>
        <q-item-section side>
          <div class="text-grey-8">
            <q-btn
              type="a"
              href="https://ssp.imcce.fr/webservices/miriade/api/ephemcc/"
              target="_blank"
              class="row"
              size="12px"
              flat
              dense
              round
              icon="open_in_new"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator vertical />
    <div class="q-gutter-md q-pa-md col-4">
      <img src="https://dishas.obspm.fr/img/logo-syrte.png" />
      <img src="https://dishas.obspm.fr/img/logo-cnrs.png" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const version = computed(() => import.meta.env.VITE_VERSION);
const api_url = computed(() => `${import.meta.env.VITE_KANON_API}/docs`);
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
  color: grey;
  font-style: italic;
  font-weight: bold;
}
#dishas_logo {
  height: fit-content;
}
</style>
