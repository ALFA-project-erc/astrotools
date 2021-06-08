<template>
  <q-card>
    <q-card-section>
      <q-select
        filled
        :options="calendars"
        label="Calendar"
        v-model="selectedCalendar"
      />
    </q-card-section>
    <q-separator />
    <q-inner-loading :showing="infoLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <div v-if="calendarInfos">
      <q-card-section horizontal class="q-px-md q-pb-md" v-show="!infoLoading">
        <q-card-section class="col-6">
          <div class="q-gutter-md">
            <div>
              {{ calendarInfos.common_year }} /
              {{ calendarInfos.leap_year }}
              <q-item-label caption>Common year / Leap year</q-item-label>
            </div>
            <div>
              {{ calendarInfos.era }}
              <q-item-label caption>Era starting day</q-item-label>
            </div>
            <q-markup-table separator="cell" flat bordered>
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Name</th>
                  <th class="text-right">Days Common Year</th>
                  <th class="text-right">Days Leap Year</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(month, idx) in calendarInfos.months"
                  :key="month.name"
                >
                  <td class="text-left">{{ idx + 1 }}</td>
                  <td class="text-left">{{ month.name }}</td>
                  <td class="text-right">{{ month.days_cy }}</td>
                  <td class="text-right">
                    {{ month.days_ly === month.days_cy ? "-" : month.days_ly }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            outlined
            :options="calendars"
            label="Convert to"
            v-model="selectedConvertTo"
          />
          <DatePicker
            :maxDays="maxDays"
            :maxMonth="maxMonth"
            :calendar="calendarInfos.name"
            :loading="convertLoading"
            @submit="convert"
            class="col"
          />
          <q-markup-table
            separator="vertical"
            flat
            bordered
            v-if="conversionResult"
          >
            <thead>
              <tr>
                <th class="text-left">{{ selectedCalendar }}</th>
                <th class="text-right">{{ selectedConvertTo }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-left">{{ conversionInput.date }}</td>
                <td class="text-right">{{ conversionResult.date }}</td>
              </tr>
              <tr>
                <td class="text-right">{{ conversionInput.ymd.join("/") }}</td>
                <td class="text-left">{{ conversionResult.ymd.join("/") }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card-section>
    </div>
  </q-card>
</template>

<script lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import {
  CalendarInfos,
  DateResponse,
  getCalendarInfos,
  getOpenAPISchema,
  jdnToDate,
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
      conversionResult.value = null;
      conversionInput.value = null;
      infoLoading.value = true;
      try {
        calendarInfos.value = await getCalendarInfos(selectedCalendar.value);
      } catch (error) {
        calendarInfos.value = null;
      }
      infoLoading.value = false;
    });

    const conversionResult = ref<DateResponse | null>(null);
    const conversionInput = ref<DateResponse | null>(null);

    const convert = async ({
      jdn,
      date,
      day,
      month,
      year,
    }: {
      jdn: number;
      date: string;
      day: number;
      month: number;
      year: number;
    }) => {
      if (!selectedConvertTo.value) return;
      convertLoading.value = true;
      conversionInput.value = { date, ymd: [year, month, day] };
      try {
        conversionResult.value = await jdnToDate(selectedConvertTo.value, jdn);
      } catch (error) {
        conversionResult.value = { date: error.response, ymd: [0, 0, 0] };
      }
      convertLoading.value = false;
    };

    return {
      calendars,
      selectedCalendar,
      selectedConvertTo,
      infoLoading,
      convertLoading,
      calendarInfos,
      tab: ref("one"),
      convert,
      conversionInput,
      conversionResult,
    };
  },
  computed: {
    maxDays(): number {
      if (!this.calendarInfos) return 0;
      return Math.max(
        ...this.calendarInfos.months.map((m) => m.days_ly || m.days_cy)
      );
    },
    maxMonth(): number {
      if (!this.calendarInfos) return 0;
      return this.calendarInfos.months.length;
    },
  },
});
</script>
