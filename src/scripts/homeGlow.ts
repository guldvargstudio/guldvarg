import {
	homeGlowEnterEasingCss,
	homeGlowEnterTransitionMs,
	homeGlowLeaveEasingCss,
	homeGlowLeaveTransitionMs,
} from "../config/motion";
import { COLOR_HOME_BG } from "../config/designTokens";
import {
	freezePageBgAtDisplayedColor,
	getDisplayedPageBgEnd,
	hasActiveColorAnimation,
} from "../lib/pageBackground";
import { isInternalNavigationLink } from "../lib/navigation";
import { storeNavDirection } from "../lib/slideNavigation";
import { resolveNavDirection } from "../lib/stepNavDirection";
import { navigate, TRANSITION_AFTER_SWAP } from "astro:transitions/client";
import { animateHomeLogoIn, animateHomeLogoOut, hideHomeLogoInstant, showHomeLogoInstant } from "./homeLogo";

const GLOW_TRANSFORM = "translate(-50%, -50%)";

let leaveAnimation: Promise<void> | null = null;
let handledClientSwap = false;
let positionObserver: ResizeObserver | null = null;

function getHomeGlowAnchor() {
	return (
		document.querySelector<HTMLElement>(".home-hero__logo") ??
		document.querySelector<HTMLElement>(".home-hero")
	);
}

function syncHomeGlowPosition() {
	const glow = getHomeGlow();
	const anchor = getHomeGlowAnchor();
	if (!glow || !anchor) return;

	const rect = anchor.getBoundingClientRect();
	glow.style.top = `${rect.top + rect.height / 2}px`;
	glow.style.left = `${rect.left + rect.width / 2}px`;
}

function observeHomeGlowPosition() {
	positionObserver?.disconnect();
	positionObserver = null;

	if (!isHomePage()) return;

	const anchor = getHomeGlowAnchor();
	if (!anchor) return;

	syncHomeGlowPosition();

	positionObserver = new ResizeObserver(() => {
		syncHomeGlowPosition();
	});

	positionObserver.observe(anchor);

	const hero = anchor.closest(".home-hero");
	if (hero instanceof HTMLElement) {
		positionObserver.observe(hero);
	}

	const landing = anchor.closest(".home-landing");
	if (landing instanceof HTMLElement) {
		positionObserver.observe(landing);
	}
}

function disconnectHomeGlowPositionObserver() {
	positionObserver?.disconnect();
	positionObserver = null;
}

function isHomePage() {
	return (
		document.body.dataset.pageBgEnd === COLOR_HOME_BG ||
		document.querySelector(".home") !== null
	);
}

function getHomeGlow() {
	return document.getElementById("home-glow");
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cancelGlowAnimations(glow: HTMLElement) {
	for (const animation of glow.getAnimations()) {
		animation.cancel();
	}
}

function setGlowScale(glow: HTMLElement, scale: number) {
	cancelGlowAnimations(glow);
	glow.style.transform = `${GLOW_TRANSFORM} scale(${scale})`;
}

function animateGlowScale(
	glow: HTMLElement,
	from: number,
	to: number,
	duration: number,
	easing: string,
) {
	cancelGlowAnimations(glow);
	glow.style.transform = `${GLOW_TRANSFORM} scale(${from})`;

	const animation = glow.animate(
		[
			{ transform: `${GLOW_TRANSFORM} scale(${from})` },
			{ transform: `${GLOW_TRANSFORM} scale(${to})` },
		],
		{ duration, easing, fill: "forwards" },
	);

	return new Promise<void>((resolve) => {
		animation.addEventListener("finish", () => resolve(), { once: true });
		animation.addEventListener("cancel", () => resolve(), { once: true });
	});
}

export function hideHomeGlowInstant() {
	const glow = getHomeGlow();
	if (!glow) return;
	syncHomeGlowPosition();
	setGlowScale(glow, 0);
}

export function showHomeGlowInstant() {
	const glow = getHomeGlow();
	if (!glow) return;
	syncHomeGlowPosition();
	setGlowScale(glow, 1);
}

export function animateHomeGlowOut() {
	if (!isHomePage()) {
		return Promise.resolve();
	}

	if (leaveAnimation) {
		return leaveAnimation;
	}

	const glow = getHomeGlow();
	if (!glow) {
		return Promise.resolve();
	}

	syncHomeGlowPosition();

	if (prefersReducedMotion()) {
		hideHomeGlowInstant();
		return Promise.resolve();
	}

	leaveAnimation = animateGlowScale(
		glow,
		1,
		0,
		homeGlowLeaveTransitionMs,
		homeGlowLeaveEasingCss,
	).finally(() => {
		leaveAnimation = null;
	});

	return leaveAnimation;
}

export function animateHomeGlowIn() {
	const glow = getHomeGlow();
	if (!glow || !isHomePage()) return Promise.resolve();

	syncHomeGlowPosition();

	if (prefersReducedMotion()) {
		showHomeGlowInstant();
		return Promise.resolve();
	}

	return animateGlowScale(
		glow,
		0,
		1,
		homeGlowEnterTransitionMs,
		homeGlowEnterEasingCss,
	);
}

export function animateHomeLeave() {
	return Promise.all([animateHomeGlowOut(), animateHomeLogoOut()]);
}

export function animateHomeEnter() {
	return Promise.all([animateHomeGlowIn(), animateHomeLogoIn()]);
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

document.addEventListener(TRANSITION_AFTER_SWAP, () => {
	handledClientSwap = true;

	if (document.body.dataset.pageBgEnd === COLOR_HOME_BG) {
		observeHomeGlowPosition();
		hideHomeGlowInstant();
		hideHomeLogoInstant();
		requestAnimationFrame(() => {
			syncHomeGlowPosition();
			hideHomeGlowInstant();
			hideHomeLogoInstant();
		});
	} else {
		disconnectHomeGlowPositionObserver();
	}
});

document.addEventListener("page-bg-transition-complete", handlePageBgTransitionComplete);

document.addEventListener("astro:page-load", () => {
	if (handledClientSwap) {
		handledClientSwap = false;

		if (document.body.dataset.pageBgEnd === COLOR_HOME_BG) {
			observeHomeGlowPosition();
			hideHomeGlowInstant();
			hideHomeLogoInstant();
		}

		return;
	}

	if (!isHomePage()) {
		disconnectHomeGlowPositionObserver();
		return;
	}

	observeHomeGlowPosition();

	const endColor = document.body.dataset.pageBgEnd;
	if (endColor !== COLOR_HOME_BG) return;

	if (hasActiveColorAnimation() || getDisplayedPageBgEnd() !== COLOR_HOME_BG) {
		hideHomeGlowInstant();
		hideHomeLogoInstant();
		return;
	}

	showHomeGlowInstant();
	showHomeLogoInstant();
});

window.addEventListener("resize", () => {
	if (isHomePage()) {
		syncHomeGlowPosition();
	}
});
