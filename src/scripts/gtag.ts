import { googleAnalyticsId } from "../config/site";

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
	}
}

function trackPageView() {
	window.gtag?.("config", googleAnalyticsId, {
		page_path: window.location.pathname + window.location.search,
	});
}

document.addEventListener("astro:page-load", trackPageView);
