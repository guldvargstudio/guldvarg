import {
	homeRadialGradientEnterEasingCss,
	homeRadialGradientEnterTransitionMs,
	homeRadialGradientLeaveEasingCss,
	homeRadialGradientLeaveTransitionMs,
} from "../config/motion";
import { COLOR_HOME_BG } from "../config/designTokens";
import { isHomePage } from "../lib/isHomePage";
import {
	getDisplayedPageBgEnd,
	hasActiveColorAnimation,
} from "../lib/pageBackground";

const GRADIENT_TRANSFORM = "translate(-50%, -50%)";

let leaveAnimation: Promise<void> | null = null;
let positionObserver: ResizeObserver | null = null;

function getHomeRadialGradient() {
	return document.getElementById("home-radial-gradient");
}

function getHomeRadialGradientAnchor() {
	return (
		document.querySelector<HTMLElement>(".home-hero__logo") ??
		document.querySelector<HTMLElement>(".home-hero")
	);
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function syncHomeRadialGradientPosition() {
	const gradient = getHomeRadialGradient();
	const anchor = getHomeRadialGradientAnchor();
	if (!gradient || !anchor) return;

	const rect = anchor.getBoundingClientRect();
	gradient.style.top = `${rect.top + rect.height / 2}px`;
	gradient.style.left = `${rect.left + rect.width / 2}px`;
}

export function observeHomeRadialGradientPosition() {
	positionObserver?.disconnect();
	positionObserver = null;

	if (!isHomePage()) return;

	const anchor = getHomeRadialGradientAnchor();
	if (!anchor) return;

	syncHomeRadialGradientPosition();

	positionObserver = new ResizeObserver(() => {
		syncHomeRadialGradientPosition();
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

export function disconnectHomeRadialGradientPositionObserver() {
	positionObserver?.disconnect();
	positionObserver = null;
}

function cancelGradientAnimations(gradient: HTMLElement) {
	for (const animation of gradient.getAnimations()) {
		animation.cancel();
	}
}

function setGradientScale(gradient: HTMLElement, scale: number) {
	cancelGradientAnimations(gradient);
	gradient.style.transform = `${GRADIENT_TRANSFORM} scale(${scale})`;
}

function animateGradientScale(
	gradient: HTMLElement,
	from: number,
	to: number,
	duration: number,
	easing: string,
) {
	cancelGradientAnimations(gradient);
	gradient.style.transform = `${GRADIENT_TRANSFORM} scale(${from})`;

	const animation = gradient.animate(
		[
			{ transform: `${GRADIENT_TRANSFORM} scale(${from})` },
			{ transform: `${GRADIENT_TRANSFORM} scale(${to})` },
		],
		{ duration, easing, fill: "forwards" },
	);

	return new Promise<void>((resolve) => {
		animation.addEventListener("finish", () => resolve(), { once: true });
		animation.addEventListener("cancel", () => resolve(), { once: true });
	});
}

export function hideHomeRadialGradientInstant() {
	const gradient = getHomeRadialGradient();
	if (!gradient) return;
	syncHomeRadialGradientPosition();
	setGradientScale(gradient, 0);
}

export function showHomeRadialGradientInstant() {
	const gradient = getHomeRadialGradient();
	if (!gradient) return;
	syncHomeRadialGradientPosition();
	setGradientScale(gradient, 1);
}

export function animateHomeRadialGradientOut() {
	if (!isHomePage()) {
		return Promise.resolve();
	}

	if (leaveAnimation) {
		return leaveAnimation;
	}

	const gradient = getHomeRadialGradient();
	if (!gradient) {
		return Promise.resolve();
	}

	syncHomeRadialGradientPosition();

	if (prefersReducedMotion()) {
		hideHomeRadialGradientInstant();
		return Promise.resolve();
	}

	leaveAnimation = animateGradientScale(
		gradient,
		1,
		0,
		homeRadialGradientLeaveTransitionMs,
		homeRadialGradientLeaveEasingCss,
	).finally(() => {
		leaveAnimation = null;
	});

	return leaveAnimation;
}

export function animateHomeRadialGradientIn() {
	const gradient = getHomeRadialGradient();
	if (!gradient || !isHomePage()) return Promise.resolve();

	syncHomeRadialGradientPosition();

	if (prefersReducedMotion()) {
		showHomeRadialGradientInstant();
		return Promise.resolve();
	}

	return animateGradientScale(
		gradient,
		0,
		1,
		homeRadialGradientEnterTransitionMs,
		homeRadialGradientEnterEasingCss,
	);
}

export function syncHomeRadialGradientState() {
	if (!isHomePage()) {
		disconnectHomeRadialGradientPositionObserver();
		return;
	}

	observeHomeRadialGradientPosition();

	const endColor = document.body.dataset.pageBgEnd;
	if (endColor !== COLOR_HOME_BG) return;

	if (hasActiveColorAnimation() || getDisplayedPageBgEnd() !== COLOR_HOME_BG) {
		hideHomeRadialGradientInstant();
		return;
	}

	showHomeRadialGradientInstant();
}

export function resetHomeRadialGradientOnHomeArrival() {
	observeHomeRadialGradientPosition();
	hideHomeRadialGradientInstant();
	requestAnimationFrame(() => {
		syncHomeRadialGradientPosition();
		hideHomeRadialGradientInstant();
	});
}

window.addEventListener("resize", () => {
	if (isHomePage()) {
		syncHomeRadialGradientPosition();
	}
});
