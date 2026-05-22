// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: "https://guldvarg.com",
	image: {
		layout: 'constrained',
		responsiveStyles: true,
	},
});
