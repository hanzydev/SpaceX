<template>
    <div class="w-[200px]">
        <div
            ref="saturationRef"
            class="saturation relative h-[164px] w-full flex-grow rounded-t-lg"
            :style="{
                backgroundColor: hueColor,
            }"
        >
            <div
                ref="saturationPointerRef"
                class="absolute right-0 top-0 z-50 rounded-full ring-2 ring-white"
                :style="{
                    backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`,
                    top: `${saturationPointerPos.top}%`,
                    left: `${saturationPointerPos.left}%`,
                    width: saturationFocused ? '26px' : '24px',
                    height: saturationFocused ? '26px' : '24px',
                }"
            />
        </div>
        <div ref="hueRef" class="hue relative h-[25px] w-full rounded-b-lg">
            <div
                ref="huePointerRef"
                class="absolute left-0 top-0 z-50 rounded-full ring-2 ring-white"
                :style="{
                    backgroundColor: hueColor,
                    left: `${(color.h / 360) * 100 - 6}%`,
                    width: hueFocused ? '26px' : '24px',
                    height: hueFocused ? '26px' : '24px',
                }"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash-es';
import Color from 'color';
import { getRelativePosition } from '@/util/get-relative-position';
import { getParentWindow } from '@/util/get-parent-window';
import { getTouchId } from '@/util/get-touch-id';
import { isTouch } from '@/util/is-touch';

const { color: _color = '#ff0000' } = defineProps<{
    color?: string;
}>();

const emit = defineEmits<{
    (event: 'update:color', color: string): void;
}>();

const color = reactive(
    Color(_color).hsv().object() as {
        h: number;
        s: number;
        v: number;
    },
);

const selectedColor = computed(() => Color.hsv(color).rgb().object());
const hueColor = ref(Color.hsv(color.h, 100, 100).hex());

const saturationRef = ref<HTMLDivElement>();
const saturationPointerRef = ref<HTMLDivElement>();
const saturationPointerPos = reactive({
    top: 100 - color.v - 6,
    left: color.s - 6,
});
const saturationFocused = ref(false);

const hueRef = ref<HTMLDivElement>();
const huePointerRef = ref<HTMLDivElement>();
const hueFocused = ref(false);

const isKeyDown = ref(false);

watch(
    () => _color,
    (value) => {
        if (saturationFocused.value || hueFocused.value || isKeyDown.value) {
            return;
        }

        const colorHSV = Color(value).hsv().object();

        color.h = colorHSV.h;
        color.s = colorHSV.s;
        color.v = colorHSV.v;

        hueColor.value = Color.hsv(colorHSV.h, 100, 100).hex();

        saturationPointerPos.top = 100 - colorHSV.v - 6;
        saturationPointerPos.left = colorHSV.s - 6;
    },
);

watch(
    color,
    (value) => {
        if (!saturationFocused.value && !hueFocused.value && !isKeyDown.value) {
            return;
        }

        hueColor.value = Color.hsv(value.h, 100, 100).hex();

        emit('update:color', Color.hsv(value).hex().toLowerCase());
    },
    { deep: true },
);

watch(
    saturationPointerPos,
    (value) => {
        const { top, left } = {
            top: value.top > 0 ? value.top + 7 : value.top,
            left: value.left > 0 ? value.left + 7 : value.left,
        };

        color.s = left;
        color.v = 100 - top;
    },
    { deep: true },
);

const handleSaturationPointerMove = (event: MouseEvent | TouchEvent) => {
    const { left, top } = getRelativePosition(
        saturationRef.value!,
        event,
        getTouchId(event),
    );

    saturationFocused.value = true;
    saturationPointerPos.left = _.clamp(left * 100 - 6, -6, 100);
    saturationPointerPos.top = _.clamp(top * 100 - 6, -6, 100);
};

const handleKeyDown = (event: KeyboardEvent) => {
    const newPos = {
        top: saturationPointerPos.top,
        left: saturationPointerPos.left,
    };

    const point = event.shiftKey ? 10 : 1;

    let isKey = true;

    switch (event.key) {
        case 'ArrowUp':
            newPos.top -= point;
            break;
        case 'ArrowDown':
            newPos.top += point;
            break;
        case 'ArrowLeft':
            newPos.left -= point;
            break;
        case 'ArrowRight':
            newPos.left += point;
            break;
        default:
            isKey = false;
            return;
    }

    if (isKey) {
        event.preventDefault();

        saturationFocused.value = true;
        isKeyDown.value = true;

        const affected =
            newPos.top !== saturationPointerPos.top ? 'top' : 'left';

        saturationPointerPos[affected] = _.clamp(newPos[affected], -6, 100 - 6);
    }
};

const handleKeyUp = (event: KeyboardEvent) => {
    let isKey = true;

    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            break;
        default:
            isKey = false;
            return;
    }

    if (isKey) {
        event.preventDefault();

        saturationFocused.value = false;
        isKeyDown.value = false;
    }
};

const handleHuePointerMove = (event: MouseEvent | TouchEvent) => {
    const { left } = getRelativePosition(
        hueRef.value!,
        event,
        getTouchId(event),
    );

    hueFocused.value = true;
    color.h = _.clamp(left * 360, 0, 360);
};

const handleSaturationMouseDown = (event: MouseEvent | TouchEvent) => {
    handleSaturationPointerMove(event);

    const parentWindow = getParentWindow(saturationRef.value);
    const _isTouch = isTouch(event);

    parentWindow.addEventListener(
        _isTouch ? 'touchmove' : 'mousemove',
        handleSaturationPointerMove,
    );
    parentWindow.addEventListener(
        _isTouch ? 'touchend' : 'mouseup',
        () => {
            parentWindow.removeEventListener(
                _isTouch ? 'touchmove' : 'mousemove',
                handleSaturationPointerMove,
            );
            saturationFocused.value = false;
        },
        { once: true },
    );
};

const handleHueMouseDown = (event: MouseEvent | TouchEvent) => {
    handleHuePointerMove(event);

    const parentWindow = getParentWindow(hueRef.value);
    const _isTouch = isTouch(event);

    parentWindow.addEventListener(
        _isTouch ? 'touchmove' : 'mousemove',
        handleHuePointerMove,
    );
    parentWindow.addEventListener(
        _isTouch ? 'touchend' : 'mouseup',
        () => {
            parentWindow.removeEventListener(
                _isTouch ? 'touchmove' : 'mousemove',
                handleHuePointerMove,
            );
            hueFocused.value = false;
        },
        { once: true },
    );
};

onMounted(() => {
    saturationRef.value!.addEventListener(
        'mousedown',
        handleSaturationMouseDown,
    );
    saturationRef.value!.addEventListener(
        'touchstart',
        handleSaturationMouseDown,
    );

    hueRef.value!.addEventListener('mousedown', handleHueMouseDown);
    hueRef.value!.addEventListener('touchstart', handleHueMouseDown);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
});

onBeforeUnmount(() => {
    saturationPointerRef.value!.removeEventListener(
        'mousedown',
        handleSaturationMouseDown,
    );
    saturationPointerRef.value!.removeEventListener(
        'touchstart',
        handleSaturationMouseDown,
    );

    huePointerRef.value!.removeEventListener('mousedown', handleHueMouseDown);
    huePointerRef.value!.removeEventListener('touchstart', handleHueMouseDown);

    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
});
</script>

<style scoped>
.saturation {
    background-image: linear-gradient(0deg, #000, transparent),
        linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.hue {
    background: linear-gradient(
        to right,
        rgb(255, 0, 0),
        rgb(255, 255, 0),
        rgb(0, 255, 0),
        rgb(0, 255, 255),
        rgb(0, 0, 255),
        rgb(255, 0, 255),
        rgb(255, 0, 0)
    );
}
</style>
