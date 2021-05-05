module.exports = {
	purge: ['./src/**/*.{js,ts,jsx,tsx}'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		fontFamily: {
			body: ['IBM Plex Sans'],
		},
		extend: {
			colors: {
				orange: {
					100: '#ffede6',
					200: '#ffcab3',
					300: '#ffb899',
					400: '#ff9566',
					500: '#ff834d',
					600: '#ff7133',
					700: '#ff6019',
					800: '#e64600',
					900: '#cc3e00',
				},
			},
			spacing: {
				70: '17.5rem',
				160: '40rem',
			},
			container: false,
		},
	},
	variants: {
		extend: {
			backgroundColor: ['disabled'],
			borderColor: ['disabled'],
		},
	},
	plugins: [
		function ({ addComponents }) {
			addComponents({
				'.container': {
					width: '100%',
					marginLeft: 'auto',
					marginRight: 'auto',
					'@screen sm': { maxWidth: '640px' },
					'@screen md': { maxWidth: '768px' },
					'@screen lg': { maxWidth: '975px' },
				},
			});
		},
	],
};
