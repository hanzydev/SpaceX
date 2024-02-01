import _ from 'lodash-es';
import { isTouch } from './is-touch';
import { getTouchPoint } from './get-touch-point';
import { getParentWindow } from './get-parent-window';

export const getRelativePosition = (
    node: HTMLElement,
    event: MouseEvent | TouchEvent,
    touchId: null | number,
): {
    left: number;
    top: number;
} => {
    const rect = node.getBoundingClientRect();

    const pointer = isTouch(event)
        ? getTouchPoint(event.touches, touchId)
        : (event as MouseEvent);

    const parentWindow = getParentWindow(node);

    return {
        top: _.clamp(
            (pointer.pageY - (rect.top + parentWindow.scrollY)) / rect.height,
            0,
            1,
        ),
        left: _.clamp(
            (pointer.pageX - (rect.left + parentWindow.scrollX)) / rect.width,
            0,
            1,
        ),
    };
};
