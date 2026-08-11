import { COLOR_HOME_BG } from "../config/designTokens";
import {
	freezePageBgAtDisplayedColor,
	getDisplayedPageBgEnd,
	hasActiveColorAnimation,
} from "../lib/pageBackground";
import {
	homeGlowEnterTransitionMs,
} from "../config/motion";
import { TRANSITION_AFTER_SWAP, navigate } from "astro:transitions/client";
import { isInternalNavigationLink } from "../lib/navigation";
import { storeNavDirection } from "../lib/slideNavigation";
import { resolveNavDirection } from "../lib/stepNavDirection";
import { runAfterContentSlide } from "../lib/contentTransition";
import {
	animateHomeLogoIn,
	animateHomeLogoOut,
	destroyHomeLogoTilt,
	hideHomeLogoInstant,
	initHomeLogoTilt,
	showHomeLogoInstant,
} from "./homeLogo";
import { initHomeField, resizeHomeField, startHomeField } from "./homeField";

let handledClientSwap = false;
let fieldOpacity = 0;
let fadeFrame: number | null = null;
let fadeToken = 0;

export function isHomePage() {
	return (
		document.body.dataset.pageBgEnd === COLOR_HOME_BG ||
		document.querySelector(".home") !== null
	);
}

function getHomeFieldShell() {
	return document.getElementById("home-field-shell");
}

function getHomeField() {
	return document.getElementById("home-field");
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyFieldOpacity(value: number) {
	const shell = getHomeFieldShell();
	fieldOpacity = value;
	if (!shell) return;
	shell.style.opacity = String(value);
}

function easeInQuad(progress: number) {
	return progress * progress;
}

function easeOutCubic(progress: number) {
	return 1 - Math.pow(1 - progress, 3);
}

function stopFieldFade() {
	fadeToken += 1;
	if (fadeFrame !== null) {
		cancelAnimationFrame(fadeFrame);
		fadeFrame = null;
	}
}

function animateFieldOpacityTo(
	target: number,
	durationMs: number,
	easing: "in" | "out",
): Promise<void> {
	const token = ++fadeToken;

	return new Promise((resolve) => {
		if (prefersReducedMotion()) {
			applyFieldOpacity(target);
			resolve();
			return;
		}

		const shell = getHomeFieldShell();
		if (!shell) {
			fieldOpacity = target;
			resolve();
			return;
		}

		const from = fieldOpacity;
		if (Math.abs(from - target) < 0.005) {
			applyFieldOpacity(target);
			resolve();
			return;
		}

		const start = performance.now();
		const ease = easing === "in" ? easeInQuad : easeOutCubic;

		const tick = (now: number) => {
			if (token !== fadeToken) {
				resolve();
				return;
			}

			const progress = Math.min(1, (now - start) / durationMs);
			applyFieldOpacity(from + (target - from) * ease(progress));

			if (progress < 1) {
				fadeFrame = requestAnimationFrame(tick);
				return;
			}

			fadeFrame = null;
			applyFieldOpacity(target);
			resolve();
		};

		if (fadeFrame !== null) {
			cancelAnimationFrame(fadeFrame);
		}

		fadeFrame = requestAnimationFrame(tick);
	});
}

function prepareHomeField() {
	initHomeField();
	resizeHomeField();
	startHomeField();
}

export function showHomeField(options?: { instant?: boolean }) {
	if (prefersReducedMotion()) return Promise.resolve();

	prepareHomeField();

	if (options?.instant) {
		stopFieldFade();
		applyFieldOpacity(1);
		return Promise.resolve();
	}

	return animateFieldOpacityTo(1, homeGlowEnterTransitionMs, "out");
}

export function hideHomeField(options?: { instant?: boolean }) {
	if (prefersReducedMotion()) return Promise.resolve();

	if (options?.instant) {
		stopFieldFade();
		applyFieldOpacity(0);
	}

	return Promise.resolve();
}

export function hideHomeGlowInstant() {
	return hideHomeField({ instant: true });
}

export function showHomeGlowInstant() {
	return showHomeField({ instant: true });
}

export function animateHomeGlowOut() {
	return hideHomeField();
}

export function animateHomeGlowIn() {
	return showHomeField();
}

export function animateHomeLeave() {
	return animateHomeLogoOut();
}

export function animateHomeEnter() {
	return animateHomeLogoIn();
}

export function collapseHomeGlowOnLeaveIfHome() {
	void animateHomeLeave();
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
		return;
	}

	syncHomeLogoState();
	initHomeLogoTilt();
}

document.addEventListener(TRANSITION_AFTER_SWAP, () => {
	handledClientSwap = true;
	stopFieldFade();
	applyFieldOpacity(0);
	prepareHomeField();

	runAfterContentSlide(() => {
		void showHomeField();
	});

	if (document.body.dataset.pageBgEnd === COLOR_HOME_BG) {
		hideHomeLogoInstant();
		requestAnimationFrame(() => {
			hideHomeLogoInstant();
		});
	}
});

document.addEventListener("page-bg-transition-complete", handlePageBgTransitionComplete);

document.addEventListener("astro:page-load", () => {
	if (!handledClientSwap) {
		void showHomeField();
	}

	if (handledClientSwap) {
		handledClientSwap = false;
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

window.addEventListener("resize", () => {
	if (getHomeField()) {
		resizeHomeField();
	}
});
