/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    primary: '#3d5a80',
                    secondary: '#98c1d9',
                    bg: '#e0fbfc',
                    accent: '#ee6c4d',
                    dark: '#293241',
                }
            }
        },
    },
    plugins: [],
}
