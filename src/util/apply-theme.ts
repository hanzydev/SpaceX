import themes from '@/assets/themes.json';

export const applyTheme = () => {
    let theme = Object.entries(themes).find(
        ([name]) => name === localStorage.getItem('theme'),
    );

    if (!theme) {
        localStorage.setItem('theme', 'default');
        theme = ['default', themes.default];
    }

    const props = [
        ['--color-spacex-1', theme[1]['1']],
        ['--color-spacex-2', theme[1]['2']],
        ['--color-spacex-3', theme[1]['3']],
        ['--color-spacex-4', theme[1]['4']],
        ['--color-spacex-5', theme[1]['5']],
        ['--color-spacex-primary', theme[1]['primary']],
    ];

    for (const [prop, color] of props) {
        document.documentElement.style.setProperty(prop, color);
    }
};
