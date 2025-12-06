module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'blue-900': 'hsl(209, 23%, 22%)', // Dark Mode Elements
                'blue-950': 'hsl(207, 26%, 17%)', // Dark Mode Background
                'grey-950': 'hsl(200, 15%, 8%)', // Light Mode Text
                'grey-400': 'hsl(0, 0%, 52%)', // Light Mode Input
                'grey-50': 'hsl(0, 0%, 98%)', // Light Mode Background
                'white': 'hsl(0, 0%, 100%)', // Dark Mode Text & Light Mode Elements
            },
            fontFamily: {
                'nunito': ['Nunito Sans', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
