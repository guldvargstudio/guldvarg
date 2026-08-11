import {
	homeLogoEnterEasingCss,
	homeLogoLeaveEasingCss,
	homeLogoTransitionMs,
} from "../config/motion";
import { COLOR_HOME_BG } from "../config/designTokens";

const LOGO_LEAVE_PEAK_SCALE = 1.08;
const LOGO_ENTER_OVERSHOOT_SCALE = 1.06;

let leaveAnimation: Promise<void> | null = null;

function isHomePage() {
	return (
		document.body.dataset.pageBgEnd === COLOR_HOME_BG ||
		document.querySelector(".home") !== null
	);
}

function getHomeLogo() {
	return document.querySelector<HTMLElement>(".home-hero__logo");
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cancelLogoAnimations(logo: HTMLElement) {
	for (const animation of logo.getAnimations()) {
		animation.cancel();
	}
}

function setLogoScale(logo: HTMLElement, scale: number) {
	cancelLogoAnimations(logo);
	logo.style.transform = `scale(${scale})`;
}

function waitForAnimation(animation: Animation) {
	return new Promise<void>((resolve) => {
		animation.addEventListener("finish", () => resolve(), { once: true });
		animation.addEventListener("cancel", () => resolve(), { once: true });
	});
}

export function hideHomeLogoInstant() {
	const logo = getHomeLogo();
	if (!logo) return;
	setLogoScale(logo, 0);
}

export function showHomeLogoInstant() {
	const logo = getHomeLogo();
	if (!logo) return;
	setLogoScale(logo, 1);
}

export function animateHomeLogoOut() {
	if (!isHomePage()) {
		return Promise.resolve();
	}

	if (leaveAnimation) {
		return leaveAnimation;
	}

	const logo = getHomeLogo();
	if (!logo) {
		return Promise.resolve();
	}

	if (prefersReducedMotion()) {
		hideHomeLogoInstant();
		return Promise.resolve();
	}

	setLogoScale(logo, 1);

	leaveAnimation = waitForAnimation(
		logo.animate(
			[
				{ transform: "scale(1)", offset: 0 },
				{ transform: `scale(${LOGO_LEAVE_PEAK_SCALE})`, offset: 0.35 },
				{ transform: "scale(0)", offset: 1 },
			],
			{
				duration: homeLogoTransitionMs,
				easing: homeLogoLeaveEasingCss,
				fill: "forwards",
			},
		),
	).finally(() => {
		leaveAnimation = null;
	});

	return leaveAnimation;
}

export function animateHomeLogoIn() {
	const logo = getHomeLogo();
	if (!logo || !isHomePage()) return Promise.resolve();

	if (prefersReducedMotion()) {
		showHomeLogoInstant();
		return Promise.resolve();
	}

	setLogoScale(logo, 0);

	return waitForAnimation(
		logo.animate(
			[
				{ transform: "scale(0)", offset: 0 },
				{ transform: `scale(${LOGO_ENTER_OVERSHOOT_SCALE})`, offset: 0.72 },
				{ transform: "scale(1)", offset: 1 },
			],
			{
				duration: homeLogoTransitionMs,
				easing: homeLogoEnterEasingCss,
				fill: "forwards",
			},
		),
	);
}
