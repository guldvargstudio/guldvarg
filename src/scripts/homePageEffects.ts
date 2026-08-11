import { COLOR_HOME_BG } from "../config/designTokens";
import { isHomePage } from "../lib/isHomePage";
import {
	freezePageBgAtDisplayedColor,
	getDisplayedPageBgEnd,
	hasActiveColorAnimation,
} from "../lib/pageBackground";
import { TRANSITION_AFTER_SWAP, navigate } from "astro:transitions/client";
import { isInternalNavigationLink } from "../lib/navigation";
import { storeNavDirection } from "../lib/slideNavigation";
import { resolveNavDirection } from "../lib/stepNavDirection";
import {
	animateHomeLogoIn,
	animateHomeLogoOut,
	destroyHomeLogoTilt,
	hideHomeLogoInstant,
	initHomeLogoTilt,
	showHomeLogoInstant,
} from "./homeLogo";
import {
	animateHomeRadialGradientIn,
	animateHomeRadialGradientOut,
	disconnectHomeRadialGradientPositionObserver,
	resetHomeRadialGradientOnHomeArrival,
	syncHomeRadialGradientState,
} from "./homeRadialGradient";

let handledClientSwap = false;

export function animateHomeLeave() {
	return Promise.all([animateHomeRadialGradientOut(), animateHomeLogoOut()]);
}

export function animateHomeEnter() {
	return Promise.all([animateHomeRadialGradientIn(), animateHomeLogoIn()]);
}

function handlePageBgTransitionComplete(event: Event) {
	if (!(event instanceof CustomEvent)) return;

	const endColor = event.detail?.endColor;
	if (endColor !== COLOR_HOME_BG || !isHomePage()) return;

	void animateHomeEnter();
}

function syncHomeLogoState() {
	if (!isHomePage()) return;

	const endColor = document.body.dataset.pageBgEnd;
	if (endColor !== COLOR_HOME_BG) return;

	if (hasActiveColorAnimation() || getDisplayedPageBgEnd() !== COLOR_HOME_BG) {
		hideHomeLogoInstant();
		return;
	}

	showHomeLogoInstant();
}

function syncHomePageEffects() {
	if (!isHomePage()) {
		destroyHomeLogoTilt();
		disconnectHomeRadialGradientPositionObserver();
		return;
	}

	syncHomeLogoState();
	syncHomeRadialGradientState();
	initHomeLogoTilt();
}

document.addEventListener(TRANSITION_AFTER_SWAP, () => {
	handledClientSwap = true;

	if (document.body.dataset.pageBgEnd === COLOR_HOME_BG) {
		resetHomeRadialGradientOnHomeArrival();
		hideHomeLogoInstant();
		requestAnimationFrame(() => {
			hideHomeLogoInstant();
		});
	} else {
		disconnectHomeRadialGradientPositionObserver();
	}
});

document.addEventListener("page-bg-transition-complete", handlePageBgTransitionComplete);

document.addEventListener("astro:page-load", () => {
	if (handledClientSwap) {
		handledClientSwap = false;

		if (document.body.dataset.pageBgEnd === COLOR_HOME_BG) {
			resetHomeRadialGradientOnHomeArrival();
			hideHomeLogoInstant();
		}

		syncHomePageEffects();
		return;
	}

	syncHomePageEffects();
});

document.addEventListener(
	"click",
	(event) => {
		if (!isHomePage()) return;

		const target = event.target;
		if (!(target instanceof Element)) return;

		const link = target.closest("a[href]");
		if (!(link instanceof HTMLAnchorElement)) return;
		if (!isInternalNavigationLink(link)) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const targetPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";
		const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
		if (targetPath === currentPath) return;

		event.preventDefault();
		event.stopImmediatePropagation();

		const direction = resolveNavDirection(link);
		if (direction) {
			storeNavDirection(direction);
		}

		void (async () => {
			await animateHomeLeave();
			freezePageBgAtDisplayedColor();
			void navigate(link.href);
		})();
	},
	true,
);
