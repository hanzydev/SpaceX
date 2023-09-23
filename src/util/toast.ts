import {
    type Content,
    type ToastOptions,
    type UpdateOptions,
    type Id,
    toast as _toast,
} from 'vue3-toastify';

const DEFAULT_OPTIONS = {
    autoClose: 2000,
    theme: 'dark',
    position: 'bottom-right',
    pauseOnHover: true,
    dangerouslyHTMLString: true,
};

export const fire = (content: Content, options: ToastOptions = {}) =>
    _toast(content, Object.assign({}, DEFAULT_OPTIONS, options));

export const update = (toastId: Id, options: UpdateOptions = {}) =>
    _toast.update(toastId, options);

export const clearAll = () => _toast.clearAll();
