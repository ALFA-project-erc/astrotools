<template>
  <q-markup-table v-if="data.length > 0" class="q-mt-md">
    <thead>
      <tr>
        <th class="text-left">
          <q-btn
            label="Date"
            no-caps
            flat
            @click="showDate = (showDate + 1) % 3"
          />
        </th>
        <template v-for="(pd, idx) in data" :key="pd.planet">
          <th class="text-right">
            <q-btn
              :label="`Historical ${capitalize(pd.planet)}`"
              no-caps
              flat
              @click="showHistorical[idx] = !showHistorical[idx]"
            />
          </th>
          <template v-if="imcceEnabled">
            <th class="text-right">
              <q-btn
                label="IMCCE"
                no-caps
                flat
                @click="showImcce[idx] = !showImcce[idx]"
              />
            </th>
            <th class="text-right">
              <q-btn
                label="Difference"
                no-caps
                flat
                @click="showDiff[idx] = !showDiff[idx]"
              />
            </th>
          </template>
        </template>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(p0Data, idx) in data[0].positions" :key="p0Data.jdn">
        <td class="text-left">
          <JdnJulianDate :show-prop="showDate" :jdn="p0Data.jdn" />
        </td>
        <template v-for="(pd, planetIdx) in data" :key="pd.planet">
          <td class="text-right">
            <SexaDegrees
              :value="pd.positions[idx].position"
              :show-sexa-prop="showHistorical[planetIdx]"
            />
          </td>
          <template v-if="imcceEnabled">
            <td class="text-right">
              <SexaDegrees
                :v-if="pd.positions[idx].imcce !== undefined"
                :value="pd.positions[idx].imcce ?? ''"
                :show-sexa-prop="showImcce[planetIdx]"
              />
            </td>
            <td class="text-right">
              <SexaDegrees
                :v-if="pd.positions[idx].diff !== undefined"
                :value="pd.positions[idx].diff ?? ''"
                :show-sexa-prop="showDiff[planetIdx]"
              />
            </td>
          </template>
        </template>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch, capitalize, defineProps } from "vue";
import JdnJulianDate from "@/components/JdnJulianDate.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { EphemeridesInfo } from "@/views/EphemeridesPage.vue";

const props = defineProps<{
  data: EphemeridesInfo[];
}>();
const data = toRefs(props).data;

const showHistorical = ref<boolean[]>([]);
const showImcce = ref<boolean[]>([]);
const showDiff = ref<boolean[]>([]);

watch(data, (val) => {
  showHistorical.value = val.map(() => true);
  showImcce.value = [...showHistorical.value];
  showDiff.value = [...showHistorical.value];
});

const imcceEnabled = computed(
  () => data.value[0].positions[0].imcce !== undefined
);
const showDate = ref(1);
</script>
