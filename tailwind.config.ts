import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    'node_modules/preline/dist/*.js',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  rippleui: {
		themes: [
			{
				themeName: "custom",
				colorScheme: "dark",
        prefersColorScheme: true,
				colors: {
					primary: "#0ea5e9",
					backgroundPrimary: "#0f172a",
				},
			},
		],
	},
  plugins: [require('rippleui')],
}

export default config
