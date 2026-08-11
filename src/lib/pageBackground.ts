import { pageBgHomeTransitionMs, pageBgTransitionMs } from "../config/motion";
import {
	COLOR_BEIGE_1,
	COLOR_HOME_BG,
} from "../config/designTokens";
import { runAfterContentSlide } from "./contentTransition";

function isHomeThemeTransition(fromEnd: string, toEnd: string) {
	return fromEnd === COLOR_HOME_BG || toEnd === COLOR_HOME_BG;
}

function getPageBgTransitionDuration(fromEnd: string, toEnd: string) {
	return isHomeThemeTransition(fromEnd, toEnd) ? pageBgHomeTransitionMs : pageBgTransitionMs;
}

let displayedPageBgEnd = "";
let frozenPageBgEnd = "";
let pageBgScheduleToken = 0;
let colorAnimationToken = 0;
let colorAnimationFrame: number | null = null;
let colorAnimation: {
	fromStart: string;
	fromEnd: string;
	toStart: string;
	toEnd: string;
	start: number;
	duration: number;
	token: number;
} | null = null;

let pageBgElement: HTMLElement | null = null;
let pageBgFillElement: HTMLElement | null = null;

export function getPageBgGradient(endColor: string) {
	const { start, end } = getPageBgGradientStops(endColor);
	return formatPageBgGradient(start, end);
}

function getPageBgGradientStops(endColor: string) {
	if (endColor === COLOR_HOME_BG) {
		return { start: COLOR_HOME_BG, end: COLOR_HOME_BG };
	}

	return { start: COLOR_BEIGE_1, end: endColor };
}

function formatPageBgGradient(startColor: string, endColor: string) {
	if (startColor === endColor) {
		return startColor;
	}

	return `linear-gradient(180deg, ${startColor} 0%, ${endColor} 100%)`;
}

export function getFrozenPageBgEnd() {
	return frozenPageBgEnd;
}

export function getDisplayedPageBgEnd() {
	return displayedPageBgEnd;
}

export function hasActiveColorAnimation() {
	return colorAnimation !== null;
}

function parseHexColor(color: string): [number, number, number] | null {
	const match = color.trim().match(/^#([0-9a-f]{6})$/i);
	if (!match) return null;

	const value = Number.parseInt(match[1], 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function formatHexColor(r: number, g: number, b: number) {
	return `#${[r, g, b]
		.map((channel) => channel.toString(16).padStart(2, "0"))
		.join("")}`;
}

function lerpHexColor(fromColor: string, toColor: string, amount: number) {
	const from = parseHexColor(fromColor);
	const to = parseHexColor(toColor);
	const t = Math.min(1, Math.max(0, amount));

	if (!from || !to) {
		return t >= 0.5 ? toColor : fromColor;
	}

	return formatHexColor(
		Math.round(from[0] + (to[0] - from[0]) * t),
		Math.round(from[1] + (to[1] - from[1]) * t),
		Math.round(from[2] + (to[2] - from[2]) * t),
	);
}

function easeOutCubic(amount: number) {
	return 1 - Math.pow(1 - amount, 3);
}

function getAnimatedGradientStopsNow() {
	if (!colorAnimation) {
		return getPageBgGradientStops(displayedPageBgEnd);
	}

	const { fromStart, fromEnd, toStart, toEnd, start, duration } = colorAnimation;
	if (start === 0) {
		return { start: fromStart, end: fromEnd };
	}

	const progress = Math.min(1, (performance.now() - start) / duration);
	const t = easeOutCubic(progress);

	return {
		start: lerpHexColor(fromStart, toStart, t),
		end: lerpHexColor(fromEnd, toEnd, t),
	};
}

function syncPageBgSolid(startColor: string, endColor: string) {
	document.documentElement.style.setProperty("--page-bg-start", startColor);
	document.documentElement.style.setProperty("--page-bg-end", endColor);
	document.documentElement.style.backgroundColor = endColor;
}

function syncViewTransitionBackground(endColor: string) {
	document.documentElement.style.setProperty("--vt-bg", getPageBgGradient(endColor));
}

function ensurePageBgFill() {
	if (pageBgFillElement?.isConnected) {
		return pageBgFillElement;
	}

	const element = document.getElementById("page-bg-fill");
	if (element instanceof HTMLElement) {
		pageBgFillElement = element;
		return element;
	}

	const created = document.createElement("div");
	created.id = "page-bg-fill";
	created.setAttribute("aria-hidden", "true");
	document.body.prepend(created);
	pageBgFillElement = created;
	return created;
}

function ensurePageBg() {
	if (pageBgElement?.isConnected) {
		return pageBgElement;
	}

	const element = document.getElementById("page-bg");
	if (element instanceof HTMLElement) {
		pageBgElement = element;
		return element;
	}

	const created = document.createElement("div");
	created.id = "page-bg";
	created.setAttribute("aria-hidden", "true");
	document.body.prepend(created);
	pageBgElement = created;
	return created;
}

function lockPageBgLayerStyles(element: HTMLElement) {
	element.style.removeProperty("height");
	element.style.removeProperty("min-height");
	element.style.removeProperty("top");
	element.style.removeProperty("left");
	element.style.removeProperty("right");
	element.style.removeProperty("bottom");
	element.style.removeProperty("position");
	element.style.removeProperty("background-size");
	element.style.removeProperty("background-repeat");
}

export function lockAllPageBgLayerStyles() {
	lockPageBgLayerStyles(ensurePageBg());
	lockPageBgLayerStyles(ensurePageBgFill());
}

function paintPageBgGradient(startColor: string, endColor: string) {
	const gradient = ensurePageBg();
	const fill = ensurePageBgFill();

	lockAllPageBgLayerStyles();
	gradient.dataset.endColor = endColor;
	gradient.style.background = formatPageBgGradient(startColor, endColor);
	fill.style.backgroundColor = endColor;
	syncPageBgSolid(startColor, endColor);
	displayedPageBgEnd = endColor;
}

function paintPageBg(endColor: string) {
	const { start, end } = getPageBgGradientStops(endColor);
	paintPageBgGradient(start, end);
}

export function pinFrozenPageBg() {
	paintPageBg(frozenPageBgEnd);
}

export function initPageBackground(defaultEnd: string) {
	const endColor = document.body?.dataset.pageBgEnd ?? defaultEnd;
	displayedPageBgEnd = endColor;
	frozenPageBgEnd = endColor;
	syncViewTransitionBackground(endColor);
	paintPageBg(endColor);
}

function revealPageBackground(endColor: string) {
	pinFrozenPageBg();

	requestAnimationFrame(() => {
		animatePageBgTo(endColor);
	});
}

export function schedulePageBgEnd(endColor: string) {
	const token = ++pageBgScheduleToken;

	runAfterContentSlide(() => {
		requestAnimationFrame(() => {
			if (token !== pageBgScheduleToken) return;
			revealPageBackground(endColor);
		});
	});
}

function stopColorAnimation() {
	colorAnimationToken += 1;

	if (colorAnimationFrame !== null) {
		cancelAnimationFrame(colorAnimationFrame);
		colorAnimationFrame = null;
	}

	if (colorAnimation) {
		const { start, end } = getAnimatedGradientStopsNow();
		paintPageBgGradient(start, end);
		colorAnimation = null;
	}
}

export function freezePageBgAtDisplayedColor() {
	pageBgScheduleToken += 1;
	stopColorAnimation();
	frozenPageBgEnd = displayedPageBgEnd;
	syncViewTransitionBackground(frozenPageBgEnd);
	pinFrozenPageBg();
}

function animatePageBgTo(endColor: string) {
	if (displayedPageBgEnd === endColor && !colorAnimation) {
		notifyPageBgTransitionComplete(endColor);
		return;
	}

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (reducedMotion) {
		stopColorAnimation();
		paintPageBg(endColor);
		frozenPageBgEnd = endColor;
		notifyPageBgTransitionComplete(endColor);
		return;
	}

	stopColorAnimation();

	if (displayedPageBgEnd === endColor) {
		return;
	}

	const fromColor = displayedPageBgEnd;
	const fromStops = getPageBgGradientStops(fromColor);
	const toStops = getPageBgGradientStops(endColor);
	const duration = getPageBgTransitionDuration(fromColor, endColor);
	const token = ++colorAnimationToken;

	paintPageBgGradient(fromStops.start, fromStops.end);

	colorAnimation = {
		fromStart: fromStops.start,
		fromEnd: fromStops.end,
		toStart: toStops.start,
		toEnd: toStops.end,
		start: 0,
		duration,
		token,
	};

	const tick = (now: number) => {
		if (token !== colorAnimationToken || !colorAnimation) return;

		if (colorAnimation.start === 0) {
			colorAnimation.start = now;
		}

		const progress = Math.min(1, (now - colorAnimation.start) / colorAnimation.duration);
		const t = easeOutCubic(progress);
		const startColor = lerpHexColor(colorAnimation.fromStart, colorAnimation.toStart, t);
		const endColorLerped = lerpHexColor(colorAnimation.fromEnd, colorAnimation.toEnd, t);
		paintPageBgGradient(startColor, endColorLerped);

		if (progress < 1) {
			colorAnimationFrame = requestAnimationFrame(tick);
			return;
		}

		colorAnimation = null;
		colorAnimationFrame = null;
		paintPageBg(endColor);
		frozenPageBgEnd = endColor;
		syncViewTransitionBackground(endColor);
		notifyPageBgTransitionComplete(endColor);
	};

	colorAnimationFrame = requestAnimationFrame(tick);
}

function notifyPageBgTransitionComplete(endColor: string) {
	document.dispatchEvent(
		new CustomEvent("page-bg-transition-complete", { detail: { endColor } }),
	);
}

export function paintPageBgForTransition(endColor: string) {
	paintPageBg(endColor);
}
