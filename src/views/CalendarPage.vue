<template>
  <q-card>
    <q-card-section>
      <q-select
        v-model="selectedCalendar"
        filled
        :options="calendars"
        label="Calendar"
      />
    </q-card-section>
    <q-separator />
    <q-inner-loading :showing="infoLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <div v-if="calendarInfos">
      <q-card-section v-show="!infoLoading" horizontal class="q-px-md q-pb-md">
        <q-card-section class="col-6">
          <div class="q-gutter-md">
            <div class="row">
              <div class="col-6">
                <div>
                  {{ calendarInfos.common_year }} /
                  {{ calendarInfos.leap_year }}
                  <q-item-label caption>Common year / Leap year</q-item-label>
                </div>
                <div>
                  {{ calendarInfos.era }}
                  <q-item-label caption>Era starting day</q-item-label>
                </div>
              </div>
              <div class="col-6">
                <div>
                  {{ calendarInfos.cycle[0] }} / {{ calendarInfos.cycle[1] }}
                  <q-item-label caption
                    >Cycle (years common / years leap)</q-item-label
                  >
                </div>
              </div>
            </div>
            <q-markup-table separator="cell" flat bordered>
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Name</th>
                  <th class="text-right">Days Common Year</th>
                  <th v-if="calendarInfos.cycle[1] != 0" class="text-right">
                    Days Leap Year
                  </th>
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
                  <td v-if="calendarInfos.cycle[1] != 0" class="text-right">
                    {{ month.days_ly === month.days_cy ? "-" : month.days_ly }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="selectedConvertTo"
            outlined
            :options="calendars"
            label="Convert to"
          />
          <DatePicker
            :max-days="maxDays"
            :max-month="maxMonth"
            :calendar="calendarInfos.name"
            :loading="convertLoading"
            class="col"
            @submit="convert"
          />
          <q-markup-table
            v-if="conversionResult"
            separator="vertical"
            flat
            bordered
          >
            <thead>
              <tr>
                <th class="text-left">{{ selectedCalendar }}</th>
                <th class="text-right">{{ selectedConvertTo }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-left">{{ conversionInput?.date }}</td>
                <td class="text-right">{{ conversionResult?.date }}</td>
              </tr>
              <tr>
                <td class="text-right">{{ conversionInput?.ymd.join("/") }}</td>
                <td class="text-left">{{ conversionResult?.ymd.join("/") }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import DatePicker from "@/components/DatePicker.vue";
import {
  CalendarInfos,
  DateResponse,
  getCalendarInfos,
  getOpenAPISchema,
  jdnToDate,
} from "@/kanon-api";
import { computed, onMounted, ref, watch } from "vue";

const calendars = ref<string[]>([]);
const selectedCalendar = ref<string | undefined>(undefined);
const selectedConvertTo = ref<string | undefined>(undefined);

onMounted(async () => {
  calendars.value = (
    await getOpenAPISchema()
  ).components.schemas.SupportedCalendars.enum;
  selectedCalendar.value = calendars.value[0];
  selectedConvertTo.value = calendars.value[0];
});

const infoLoading = ref(false);
const convertLoading = ref(false);
const calendarInfos = ref<CalendarInfos | undefined>(undefined);

watch(selectedCalendar, async () => {
  if (!selectedCalendar.value) return;
  conversionResult.value = undefined;
  conversionInput.value = undefined;
  infoLoading.value = true;
  try {
    calendarInfos.value = await getCalendarInfos(selectedCalendar.value);
  } catch (error) {
    calendarInfos.value = undefined;
  }
  infoLoading.value = false;
});

const conversionResult = ref<DateResponse | undefined>(undefined);
const conversionInput = ref<DateResponse | undefined>(undefined);

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
  conversionInput.value = { date, ymd: [year, month, day], frac: 0.5 };
  try {
    conversionResult.value = await jdnToDate(selectedConvertTo.value, jdn);
  } catch (error) {
    conversionResult.value = {
      date: (error as { response: string }).response,
      ymd: [0, 0, 0],
      frac: 0.5,
    };
  }
  convertLoading.value = false;
};

const maxDays = computed((): number => {
  if (!calendarInfos.value) return 0;
  return Math.max(
    ...calendarInfos.value.months.map((m) => m.days_ly || m.days_cy)
  );
});
const maxMonth = computed((): number => {
  if (!calendarInfos.value) return 0;
  return calendarInfos.value.months.length;
});
</script>
