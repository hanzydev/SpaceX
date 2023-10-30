<template>
    <h2>System Monitor {{ store.data && `(${store.data.os.name})` }}</h2>

    <div
        v-if="!store.data"
        class="absolute inset-0 m-auto flex items-center justify-center"
    >
        <Spinner :size="64" />
    </div>
    <div v-else class="mt-6">
        <div
            class="mt-3 grid w-full grid-cols-4 gap-5 max-[1600px]:grid-cols-3 max-[1340px]:grid-cols-2 max-[1130px]:grid-cols-1"
        >
            <div
                class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
            >
                <p class="text-sm font-semibold text-slate-400">CPU MODEL</p>
                <Icon
                    name="cpu"
                    class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
                />
                <h6 class="!mt-3">
                    {{ store.data.cpu.name }} (x{{ store.data.cpu.cores }})
                </h6>
            </div>
            <div
                class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
            >
                <p class="text-sm font-semibold text-slate-400">CPU USAGE</p>
                <Icon
                    name="pulse"
                    class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
                />
                <h6 class="!mt-3">
                    {{ store.data.cpu.usage }}% ({{ store.data.cpu.speed }} GHz)
                </h6>
            </div>
            <div
                class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
            >
                <p class="text-sm font-semibold text-slate-400">DISK USAGE</p>
                <Icon
                    name="hdd"
                    class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
                />
                <h6 class="!mt-3">
                    {{ store.data.disk.used }}/{{ store.data.disk.total }} ({{
                        store.data.disk.usage
                    }}%)
                </h6>
            </div>
            <div
                class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
            >
                <p class="text-sm font-semibold text-slate-400">RAM USAGE</p>
                <Icon
                    name="memory"
                    class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
                />
                <h6 class="!mt-3">
                    {{ store.data.ram.used }}/{{ store.data.ram.total }} ({{
                        store.data.ram.usage
                    }}%)
                </h6>
            </div>
        </div>

        <h3 class="mt-6">Network (in/out)</h3>
        <div
            class="mt-3 h-96 w-full rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        >
            <canvas ref="networkChartRef" />
        </div>
        <h3 class="mt-6">CPU History</h3>
        <div
            class="mt-3 h-96 w-full rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        >
            <canvas ref="cpuChartRef" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Chart as ChartJS,
    LineController,
    Tooltip,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Legend,
} from 'chart.js';
import { useMonitorStore } from '@/store';
import themeEmitter from '@/util/emitters/theme';

ChartJS.defaults.color = '#F1F5F9';
ChartJS.defaults.font.family = 'Montserrat, sans-serif';

ChartJS.register(
    LineController,
    Tooltip,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Legend,
);

const store = useMonitorStore();

const networkChartRef = ref<HTMLCanvasElement>();
const networkChart = shallowRef<ChartJS>();
const networkChartData: {
    in: { x: number; y: number }[];
    out: { x: number; y: number }[];
} = {
    in: [],
    out: [],
};

const cpuChartRef = ref<HTMLCanvasElement>();
const cpuChart = shallowRef<ChartJS>();
const cpuChartData: { x: number; y: number }[] = [];

const primaryColor = ref('');

try {
    primaryColor.value = getComputedStyle(
        document.documentElement,
    ).getPropertyValue('--color-spacex-primary');
    // eslint-disable-next-line no-empty
} catch {}

watch(networkChartRef, (canvas) => {
    if (canvas && !networkChart.value) {
        networkChart.value = new ChartJS(canvas, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Network In (MB/s)',
                        data: [],
                        borderColor: '#13e300',
                        borderWidth: 2,
                        pointRadius: 0,
                    },
                    {
                        label: 'Network Out (MB/s)',
                        data: [],
                        borderColor: '#ff0000',
                        borderWidth: 2,
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                    },
                },
                interaction: {
                    intersect: false,
                },
            },
        });
    }
});

watch(cpuChartRef, (canvas) => {
    if (canvas && !cpuChart.value) {
        cpuChart.value = new ChartJS(canvas, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'CPU Usage (%)',
                        data: [],
                        borderColor: primaryColor.value,
                        borderWidth: 3,
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                    },
                },
                interaction: {
                    intersect: false,
                },
            },
        });
    }
});

watch(
    () => store.data,
    (data) => {
        if (networkChart.value) {
            networkChartData.in.push({
                x: networkChartData.in.length
                    ? networkChartData.in[networkChartData.in.length - 1].x + 1
                    : 0,
                y: data!.network.in,
            });
            networkChartData.out.push({
                x: networkChartData.out.length
                    ? networkChartData.out[networkChartData.out.length - 1].x +
                      1
                    : 0,
                y: data!.network.out,
            });

            if (networkChartData.in.length > 500) {
                networkChartData.in.shift();
            }

            if (networkChartData.out.length > 500) {
                networkChartData.out.shift();
            }

            networkChart.value.data.datasets[0].data = networkChartData.in;
            networkChart.value.data.datasets[1].data = networkChartData.out;

            networkChart.value.update();
        }

        if (cpuChart.value) {
            cpuChartData.push({
                x: cpuChartData.length
                    ? cpuChartData[cpuChartData.length - 1].x + 1
                    : 0,
                y: data!.cpu.usage,
            });

            if (cpuChartData.length > 500) {
                cpuChartData.shift();
            }

            cpuChart.value.data.datasets[0].data = cpuChartData;
            cpuChart.value.update();
        }
    },
);

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
});

watch(primaryColor, (primaryColor) => {
    if (cpuChart.value) {
        cpuChart.value.data.datasets![0].borderColor = primaryColor;
        cpuChart.value.update();
    }
});

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'System Monitor',
    meta: [
        {
            name: 'og:title',
            content: 'Statistics | System Monitor',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
