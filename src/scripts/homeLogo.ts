import {
	homeLogoEnterEasingCss,
	homeLogoLeaveEasingCss,
	homeLogoTransitionMs,
} from "../config/motion";
import { isHomePage } from "../lib/isHomePage";

const LOGO_LEAVE_PEAK_SCALE = 1.08;
const LOGO_ENTER_OVERSHOOT_SCALE = 1.06;
const LOGO_TILT_MAX_DEG = 14;
const LOGO_TILT_LERP = 0.13;
const LOGO_TILT_EPSILON = 0.05;
const LOGO_TILT_INFLUENCE = 0.35;

let leaveAnimation: Promise<void> | null = null;
let tiltLink: HTMLElement | null = null;
let tiltActive = false;
let tiltPaused = false;
let targetRotateX = 0;
let targetRotateY = 0;
let currentRotateX = 0;
let currentRotateY = 0;
let tiltFrame = 0;

function getHomeLogo() {
	return document.querySelector<HTMLElement>(".home-hero__logo");
}

function getHomeLogoLink() {
	return document.querySelector<HTMLElement>(".home-hero__logo-link");
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prefersFinePointer() {
	return window.matchMedia("(pointer: fine)").matches;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function clearLinkTilt(link: HTMLElement) {
	link.style.removeProperty("transform");
}

function applyLinkTilt(link: HTMLElement) {
	link.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
}

function setTiltTargets(clientX: number, clientY: number, element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;
	const influenceX = Math.max(window.innerWidth * LOGO_TILT_INFLUENCE, rect.width);
	const influenceY = Math.max(window.innerHeight * LOGO_TILT_INFLUENCE, rect.height);
	const normX = (clientX - centerX) / influenceX;
	const normY = (clientY - centerY) / influenceY;

	targetRotateY = clamp(normX, -1, 1) * LOGO_TILT_MAX_DEG;
	targetRotateX = -clamp(normY, -1, 1) * LOGO_TILT_MAX_DEG;
}

function isTiltSettled() {
	return (
		Math.abs(targetRotateX) < LOGO_TILT_EPSILON &&
		Math.abs(targetRotateY) < LOGO_TILT_EPSILON &&
		Math.abs(currentRotateX) < LOGO_TILT_EPSILON &&
		Math.abs(currentRotateY) < LOGO_TILT_EPSILON
	);
}

function stepLogoTilt() {
	tiltFrame = 0;

	if (!tiltLink || tiltPaused || !tiltActive) return;

	currentRotateX += (targetRotateX - currentRotateX) * LOGO_TILT_LERP;
	currentRotateY += (targetRotateY - currentRotateY) * LOGO_TILT_LERP;

	const settled = isTiltSettled();

	if (settled) {
		currentRotateX = 0;
		currentRotateY = 0;
		clearLinkTilt(tiltLink);
		return;
	}

	applyLinkTilt(tiltLink);

	const needsAnotherFrame =
		!isTiltSettled() ||
		Math.abs(targetRotateX - currentRotateX) > LOGO_TILT_EPSILON ||
		Math.abs(targetRotateY - currentRotateY) > LOGO_TILT_EPSILON;

	if (needsAnotherFrame) {
		tiltFrame = requestAnimationFrame(stepLogoTilt);
	}
}

function scheduleLogoTiltFrame() {
	if (tiltFrame) return;
	tiltFrame = requestAnimationFrame(stepLogoTilt);
}

function onWindowPointerMove(event: PointerEvent) {
	if (!tiltLink || tiltPaused) return;

	setTiltTargets(event.clientX, event.clientY, tiltLink);
	scheduleLogoTiltFrame();
}

function onDocumentPointerOut(event: PointerEvent) {
	if (event.relatedTarget !== null) return;
	onWindowPointerLeave();
}

function onWindowPointerLeave() {
	targetRotateX = 0;
	targetRotateY = 0;
	scheduleLogoTiltFrame();
}

export function pauseHomeLogoTilt() {
	tiltPaused = true;
	targetRotateX = 0;
	targetRotateY = 0;
	currentRotateX = 0;
	currentRotateY = 0;

	if (tiltFrame) {
		cancelAnimationFrame(tiltFrame);
		tiltFrame = 0;
	}

	if (tiltLink) {
		clearLinkTilt(tiltLink);
	}
}

export function resumeHomeLogoTilt() {
	if (!isHomePage() || prefersReducedMotion() || !prefersFinePointer()) return;
	tiltPaused = false;
}

export function initHomeLogoTilt() {
	destroyHomeLogoTilt();

	if (!isHomePage() || prefersReducedMotion() || !prefersFinePointer()) return;

	tiltLink = getHomeLogoLink();
	if (!tiltLink) return;

	tiltActive = true;
	tiltPaused = false;
	document.addEventListener("pointermove", onWindowPointerMove, { passive: true });
	document.addEventListener("pointerout", onDocumentPointerOut);
	scheduleLogoTiltFrame();
}

export function destroyHomeLogoTilt() {
	tiltActive = false;
	targetRotateX = 0;
	targetRotateY = 0;
	currentRotateX = 0;
	currentRotateY = 0;

	if (tiltFrame) {
		cancelAnimationFrame(tiltFrame);
		tiltFrame = 0;
	}

	document.removeEventListener("pointermove", onWindowPointerMove);
	document.removeEventListener("pointerout", onDocumentPointerOut);

	if (tiltLink) {
		clearLinkTilt(tiltLink);
	}

	tiltLink = null;
}

function cancelLogoAnimations(logo: HTMLElement) {
	for (const animation of logo.getAnimations()) {
		animation.cancel();
	}
}

function setLogoScale(logo: HTMLElement, scale: number) {
	cancelLogoAnimations(logo);

	if (scale === 1) {
		logo.style.removeProperty("transform");
		return;
	}

	logo.style.transform = `scale(${scale})`;
}

function clearLogoTransform(logo: HTMLElement) {
	logo.style.removeProperty("transform");
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

	pauseHomeLogoTilt();
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
	).then(() => {
		clearLogoTransform(logo);
		resumeHomeLogoTilt();
	});
}
