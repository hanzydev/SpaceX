/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{vue,tsx,jsx,js,ts,html}'],
    theme: {
        extend: {
            screens: {
                xs: '420px',
            },
            colors: {
                spacex: {
                    1: 'var(--color-spacex-1)',
                    2: 'var(--color-spacex-2)',
                    3: 'var(--color-spacex-3)',
                    4: 'var(--color-spacex-4)',
                    5: 'var(--color-spacex-5)',
                    primary: 'var(--color-spacex-primary)',
                },
            },
        },
    },
};
