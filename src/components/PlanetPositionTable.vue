<template>
  <q-markup-table v-if="data.length > 0" class="q-mt-md">
    <thead>
      <tr>
        <th class="text-left">
          <q-btn
            @click="showDate = (showDate + 1) % 3"
            label="Date"
            no-caps
            flat
          />
        </th>
        <template v-for="(pd, idx) in data" :key="pd.planet">
          <th class="text-right">
            <q-btn
              @click="showHistorical[idx] = !showHistorical[idx]"
              :label="`Historical ${capitalize(pd.planet)}`"
              no-caps
              flat
            />
          </th>
          <template v-if="imcceEnabled">
            <th class="text-right">
              <q-btn
                @click="showImcce[idx] = !showImcce[idx]"
                label="IMCCE"
                no-caps
                flat
              />
            </th>
            <th class="text-right">
              <q-btn
                @click="showDiff[idx] = !showDiff[idx]"
                label="Difference"
                no-caps
                flat
              />
            </th>
          </template>
        </template>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(p0Data, idx) in data[0].positions" :key="p0Data.jdn">
        <td class="text-left">
          <JdnJulianDate :showProp="showDate" :jdn="p0Data.jdn" />
        </td>
        <template v-for="(pd, planetIdx) in data" :key="pd.planet">
          <td class="text-right">
            <SexaDegrees
              :value="pd.positions[idx].position"
              :showSexaProp="showHistorical[planetIdx]"
            />
          </td>
          <template v-if="imcceEnabled">
            <td class="text-right">
              <SexaDegrees
                :v-if="pd.positions[idx].imcce !== undefined"
                :value="pd.positions[idx].imcce"
                :showSexaProp="showImcce[planetIdx]"
              />
            </td>
            <td class="text-right">
              <SexaDegrees
                :v-if="pd.positions[idx].diff !== undefined"
                :value="pd.positions[idx].diff"
                :showSexaProp="showDiff[planetIdx]"
              />
            </td>
          </template>
        </template>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  toRefs,
  watch,
  capitalize,
} from "vue";
import JdnJulianDate from "@/components/JdnJulianDate.vue";
import SexaDegrees from "@/components/SexaDegrees.vue";
import { EphemeridesInfo } from "@/views/Ephemerides.vue";

export default defineComponent({
  components: { SexaDegrees, JdnJulianDate },
  props: {
    data: {
      type: Object as PropType<EphemeridesInfo[]>,
      required: true,
    },
  },
  setup(props) {
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
    return {
      showHistorical,
      showImcce,
      showDiff,
      showDate: ref(1),
      imcceEnabled,
      capitalize,
    };
  },
});
</script>
