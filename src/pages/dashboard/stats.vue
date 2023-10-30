<template>
    <h2>Statistics</h2>
    <div>
        <Stats class="mt-6" />
        <h3 class="mt-6">Views</h3>
        <div
            class="mt-3 h-96 w-full rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        >
            <canvas ref="viewsChartRef" />
        </div>

        <h3 class="mt-6">Types</h3>
        <div
            class="mt-3 flex w-full items-center gap-20 rounded-lg bg-spacex-3 px-4 py-3 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary max-xl:flex-col max-xl:justify-center max-xl:gap-8"
        >
            <table class="w-full table-auto rounded-lg bg-spacex-3">
                <thead class="h-10 text-left">
                    <tr>
                        <th class="p-2 font-semibold">Type</th>
                        <th class="p-2 font-semibold">Count</th>
                    </tr>
                </thead>
                <tbody class="border-none text-slate-100">
                    <tr
                        v-for="(type, index) in store.stats.chart!.types.labels"
                        :key="index"
                    >
                        <td class="border-t border-spacex-1 p-2">
                            <span>{{ type }}</span>
                        </td>
                        <td class="border-t border-spacex-1 p-2">
                            <span>{{
                                store.stats.chart!.types.data[
                                    store.stats.chart!.types.labels.indexOf(
                                        type,
                                    )
                                ]
                            }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <canvas
                ref="typesChartRef"
                class="max-h-80 max-w-[20rem] max-xl:h-full max-xl:w-full xl:ml-auto"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Chart as ChartJS,
    LineController,
    PieController,
    Tooltip,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
} from 'chart.js';
import themeEmitter from '@/util/emitters/theme';
import { colorHash } from '@/util/color-hash';
import { useStatsStore } from '@/store';

const store = useStatsStore();

if (!store.statsLoaded) {
    await store.fetchStats();
}

ChartJS.defaults.color = '#F1F5F9';
ChartJS.defaults.font.family = 'Montserrat, sans-serif';

ChartJS.register(
    LineController,
    PieController,
    Tooltip,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
);

const viewsChartRef = ref<HTMLCanvasElement>();
const viewsChart = shallowRef<ChartJS<'line'>>();

const typesChartRef = ref<HTMLCanvasElement>();
const typesChart = shallowRef<ChartJS<'pie'>>();

const primaryColor = ref('');

try {
    primaryColor.value = getComputedStyle(
        document.documentElement,
    ).getPropertyValue('--color-spacex-primary');
    // eslint-disable-next-line no-empty
} catch {}

onMounted(() => {
    primaryColor.value = getComputedStyle(
        document.documentElement,
    ).getPropertyValue('--color-spacex-primary');

    ChartJS.defaults.plugins.tooltip.backgroundColor = getComputedStyle(
        document.documentElement,
    ).getPropertyValue('--color-spacex-4');

    themeEmitter.on('change', () => {
        primaryColor.value = getComputedStyle(
            document.documentElement,
        ).getPropertyValue('--color-spacex-primary');

        ChartJS.defaults.plugins.tooltip.backgroundColor = getComputedStyle(
            document.documentElement,
        ).getPropertyValue('--color-spacex-4');
    });

    viewsChart.value = new ChartJS(viewsChartRef.value!, {
        type: 'line',
        data: {
            labels: store.stats.chart!.views.labels,
            datasets: [
                {
                    data: store.stats.chart!.views.data,
                    fill: false,
                    borderColor: primaryColor.value,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });

    typesChart.value = new ChartJS(typesChartRef.value!, {
        type: 'pie',
        data: {
            labels: store.stats.chart!.types.labels,
            datasets: [
                {
                    data: store.stats.chart!.types.data,
                    backgroundColor: store.stats.chart!.types.labels.map(
                        (type) => colorHash(type),
                    ),
                    hoverOffset: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
});

watch(primaryColor, () => {
    if (viewsChart.value) {
        viewsChart.value.data.datasets![0].borderColor = primaryColor.value;
        viewsChart.value.update();
    }
});

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Statistics',
    meta: [
        {
            name: 'og:title',
            content: 'Statistics | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
