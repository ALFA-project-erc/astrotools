<template>
  <q-select :options="calendars" label="Calendar" v-model="selectedCalendar" />

  <q-card v-if="calendarInfos">
    <q-inner-loading :showing="infoLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <div v-show="!infoLoading">
      <q-card-section>
        <div class="text-h6">
          {{ calendarInfos.name }}
        </div>
      </q-card-section>
      <q-tabs v-model="tab">
        <q-tab label="Infos" name="one" />
        <q-tab label="Conversion" name="two" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="one">
          <q-list>
            <q-item>
              <q-item-label
                >{{ calendarInfos.common_year }} /
                {{ calendarInfos.leap_year }}</q-item-label
              >
              <q-item-label caption>Common year / Leap year</q-item-label>
            </q-item>
            <q-item>
              <q-item-label>{{ calendarInfos.era }}</q-item-label>
              <q-item-label caption>Era starting day</q-item-label>
            </q-item>
            <q-item>
              <q-item-label
                >{{ calendarInfos.months.length }} months</q-item-label
              >
              <q-btn
                color="grey"
                round
                flat
                dense
                :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                @click="expanded = !expanded"
              />
            </q-item>
            <q-slide-transition>
              <div v-show="expanded">
                <q-separator />
                <q-item
                  v-for="(month, idx) in calendarInfos.months"
                  :key="month.name"
                >
                  <q-item-label> {{ idx + 1 }} {{ month.name }} </q-item-label>
                  <q-item-label caption
                    >{{ month.days_cy }} / {{ month.days_ly }}</q-item-label
                  >
                </q-item>
              </div>
            </q-slide-transition>
          </q-list>
        </q-tab-panel>
        <q-tab-panel name="two">
          <q-select
            :options="calendars"
            label="Calendar"
            v-model="selectedConvertTo"
          />
          <DatePicker
            :maxDays="maxDays"
            :maxMonth="maxMonth"
            :calendar="calendarInfos.name"
            :loading="convertLoading"
            @submit="convert"
          />
          {{ conversionResult }}
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-card>
</template>

<script lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import {
  CalendarInfos,
  getCalendarInfos,
  getOpenAPISchema,
  jdnToYmd,
} from "@/kanon-api";
import { defineComponent, onMounted, ref, watch } from "vue";

export default defineComponent({
  components: { DatePicker },
  setup() {
    const calendars = ref<string[]>([]);
    const selectedCalendar = ref<string | null>(null);
    const selectedConvertTo = ref<string | null>(null);

    onMounted(async () => {
      calendars.value = (
        await getOpenAPISchema()
      ).components.schemas.SupportedCalendars.enum;
      selectedCalendar.value = calendars.value[0];
      selectedConvertTo.value = calendars.value[0];
    });

    const infoLoading = ref(false);
    const convertLoading = ref(false);
    const calendarInfos = ref<CalendarInfos | null>(null);

    watch(selectedCalendar, async () => {
      if (!selectedCalendar.value) return;
      conversionResult.value = "";
      infoLoading.value = true;
      try {
        calendarInfos.value = await getCalendarInfos(selectedCalendar.value);
      } catch (error) {
        calendarInfos.value = null;
      }
      infoLoading.value = false;
    });

    const conversionResult = ref("");

    const convert = async ({ jdn }: { jdn: number }) => {
      if (!selectedConvertTo.value) return;
      convertLoading.value = true;
      try {
        conversionResult.value = (
          await jdnToYmd(selectedConvertTo.value, jdn)
        ).date;
      } catch (error) {
        conversionResult.value = error.response;
      }
      convertLoading.value = false;
    };

    return {
      calendars,
      selectedCalendar,
      selectedConvertTo,
      infoLoading,
      calendarInfos,
      expanded: ref(false),
      tab: ref("one"),
      convert,
      convertLoading,
      conversionResult,
    };
  },
  computed: {
    maxDays(): number {
      if (!this.calendarInfos) return 0;
      return Math.max(...this.calendarInfos.months.map((m) => m.days_ly));
    },
    maxMonth(): number {
      if (!this.calendarInfos) return 0;
      return this.calendarInfos.months.length;
    },
  },
});
</script>
