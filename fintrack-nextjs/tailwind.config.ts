import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e6eef4',
                    100: '#ccdde9',
                    200: '#99bbd3',
                    300: '#6699bd',
                    400: '#3377a7',
                    500: '#0A2A43', // Dark Navy Blue - Main
                    600: '#082235',
                    700: '#061928',
                    800: '#04111a',
                    900: '#02080d',
                },
                accent: {
                    50: '#e9f7ef',
                    100: '#d3efdf',
                    200: '#a7dfbf',
                    300: '#7bcf9f',
                    400: '#4fbf7f',
                    500: '#2ECC71', // Fresh Green - Accent
                    600: '#25a35a',
                    700: '#1c7a44',
                    800: '#12522d',
                    900: '#092917',
                },
                background: {
                    DEFAULT: '#F2F4F8', // Light Gray - Background
                    dark: '#e5e9f0',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #0A2A43 0%, #2ECC71 100%)',
                'gradient-accent': 'linear-gradient(135deg, #2ECC71 0%, #25a35a 100%)',
            },
            boxShadow: {
                'soft': '0 10px 40px rgba(10, 42, 67, 0.08)',
                'hover': '0 20px 50px rgba(10, 42, 67, 0.15)',
            },
            backdropBlur: {
                'glass': '20px',
            },
        },
    },
    plugins: [],
};

export default config;
