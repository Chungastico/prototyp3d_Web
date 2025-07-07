/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
        colors: {
            beige: {
                claro: '#E8DFD5',
                medio: '#DEB399',
            },
            naranja: '#FF7123',
            azul: {
                DEFAULT: '#3B4883',
                oscuro: '#262C4D',
                black: '#13192F',
            },
            negro: '#202124',
        },
        fontFamily: {
            garet: ['"Garet"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
