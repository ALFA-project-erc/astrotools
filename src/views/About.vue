<template>
  <div class="q-pa-md">
    <div class="text-h4">AstroTools v{{ version }}</div>
    <div class="text-subtitle1">
      Find the source code
      <a href="https://github.com/legau/astrotools">here</a>.
    </div>
    <q-separator />
    <div class="q-pt-md">
      <p>
        Please report any bug or request features
        <a href="https://github.com/legau/astrotools/issues/new">here</a>.
      </p>
      <p>
        Find the API documentation
        <a :href="api_url">here</a>.
      </p>
    </div>

    <div class="text-subtitle1">Sources :</div>
    <q-list style="max-width: 400px" separator>
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
              class="row"
              size="12px"
              flat
              dense
              round
              icon="open_in_new"
              @click="open('https://gitlab.obspm.fr/lgauffier/kanon')"
            />
            <q-btn
              class="row"
              size="12px"
              flat
              dense
              round
              icon="open_in_new"
              @click="open('https://github.com/legau/kanon-api')"
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
              class="row"
              size="12px"
              flat
              dense
              round
              icon="open_in_new"
              @click="
                open('https://ssp.imcce.fr/webservices/miriade/api/ephemcc/')
              "
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const version = computed(() => process.env.VUE_APP_VERSION);
    const api_url = computed(() => `${process.env.VUE_APP_KANON_API}/docs`);
    return {
      version,
      open: (link: string) => window.open(link, "_blank"),
      api_url,
    };
  },
});
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
  color: grey;
  font-style: italic;
  font-weight: bold;
}
</style>
