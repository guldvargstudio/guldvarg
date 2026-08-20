type LinePoint = {
	bx: number;
	by: number;
	x: number;
	y: number;
};

import {
	backgroundLinesFadeInTransitionMs,
	backgroundLinesOpacityDefault,
	backgroundLinesOpacityHome,
} from "../config/motion";
import { hasHomeBackground } from "../lib/isHomePage";
import { runAfterContentSlide } from "../lib/contentTransition";
import { TRANSITION_AFTER_SWAP } from "astro:transitions/client";

const LINE_RGB = "158, 89, 0";
const GRID_CELL_PX = 32;
const FIELD_BLEED_RATIO = 0.16;
const TERRAIN_DRIFT = 0.12;
const LINE_GAP_MIN_RATIO = 0.32;
const LINE_GAP_MAX_RATIO = 3.2;
const POINTER_RADIUS_RATIO = 0.18;
const POINTER_STRENGTH_RATIO = 0.035;
const POINTER_PULL = 0.1;

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
let animationFrame = 0;
let rows = 0;
let verticalLines: LinePoint[][] = [];
let width = 0;
let height = 0;
let running = false;
let bound = false;

const pointer = {
	x: -9999,
	y: -9999,
	active: false,
};

function getLineStrokeColor() {
	const alpha = hasHomeBackground()
		? backgroundLinesOpacityHome
		: backgroundLinesOpacityDefault;
	return `rgba(${LINE_RGB}, ${alpha})`;
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prefersCoarsePointer() {
	return window.matchMedia("(pointer: coarse)").matches;
}

function getCanvas() {
	const element = document.getElementById("background-lines");
	return element instanceof HTMLCanvasElement ? element : null;
}

function hash2(x: number, y: number) {
	const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return value - Math.floor(value);
}

function smoothstep(t: number) {
	return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number) {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	const fx = smoothstep(x - ix);
	const fy = smoothstep(y - iy);
	const a = hash2(ix, iy);
	const b = hash2(ix + 1, iy);
	const c = hash2(ix, iy + 1);
	const d = hash2(ix + 1, iy + 1);
	return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

function fbm(x: number, y: number, octaves = 2) {
	let value = 0;
	let amplitude = 0.5;
	let frequency = 1;

	for (let i = 0; i < octaves; i += 1) {
		value += amplitude * valueNoise(x * frequency, y * frequency);
		amplitude *= 0.5;
		frequency *= 2;
	}

	return value;
}

function getWaveOffset(bx: number, by: number, time: number) {
	const scale = Math.min(width, height) || 1;
	const nx = bx / (width || 1);
	const ny = by / (height || 1);
	const t = time * TERRAIN_DRIFT;

	let dx = 0;
	dx +=
		Math.sin(ny * Math.PI * 1.15 + Math.sin(nx * Math.PI * 0.85 + t) * 1.35) *
		scale *
		0.12;
	dx +=
		Math.sin(ny * Math.PI * 0.62 + nx * Math.PI * 0.5 + t * 0.65) *
		scale *
		0.078;
	dx +=
		Math.cos(ny * Math.PI * 0.38 - nx * Math.PI * 0.68 + t * 0.38) *
		scale *
		0.055;

	const u = bx * 0.0015;
	const v = by * 0.0013 + t * 0.08;
	dx += (fbm(u, v, 2) - 0.5) * scale * 0.06;

	let dy =
		Math.sin(nx * Math.PI * 0.72 + ny * Math.PI * 0.26 + t * 0.45) *
		scale *
		0.022;
	dy += (fbm(u + 3, v + 2, 2) - 0.5) * scale * 0.016;

	return { dx, dy };
}

function columnGapAt(x: number, minX: number, maxX: number) {
	const u = (x - minX) / (maxX - minX);
	const pack = fbm(u * 1.55 + 2.3, 0.18, 2);
	const minGap = GRID_CELL_PX * LINE_GAP_MIN_RATIO;
	const maxGap = GRID_CELL_PX * LINE_GAP_MAX_RATIO;
	const mix = pack * 0.68 + Math.random() * 0.32;

	return minGap + (maxGap - minGap) * (1 - mix);
}

function getFieldBleed() {
	return Math.min(width, height) * FIELD_BLEED_RATIO;
}

function buildColumnPositions(nextWidth: number, bleedX: number) {
	const minX = -bleedX;
	const maxX = nextWidth + bleedX;
	const positions = [minX];
	let x = minX;

	while (x < maxX) {
		x += columnGapAt(x, minX, maxX);
		if (x < maxX - GRID_CELL_PX * 0.2) {
			positions.push(x);
		}
	}

	if (positions[positions.length - 1] < maxX - 1) {
		positions.push(maxX);
	}

	return positions;
}

function buildGrid(nextWidth: number, nextHeight: number) {
	width = nextWidth;
	height = nextHeight;

	const bleed = getFieldBleed();
	const minY = -bleed;
	const maxY = nextHeight + bleed;
	const spanY = maxY - minY;

	rows = Math.max(16, Math.round(spanY / GRID_CELL_PX));
	const stepY = spanY / rows;
	const columnXs = buildColumnPositions(width, bleed);

	verticalLines = columnXs.map((bx) => {
		const linePoints: LinePoint[] = [];

		for (let row = 0; row <= rows; row += 1) {
			const by = minY + row * stepY;
			const wave = getWaveOffset(bx, by, 0);
			linePoints.push({ bx, by, x: bx + wave.dx, y: by + wave.dy });
		}

		return linePoints;
	});
}

function resizeCanvas() {
	canvas = getCanvas();
	if (!canvas) return;

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const rect = canvas.getBoundingClientRect();
	const nextWidth = Math.max(1, rect.width);
	const nextHeight = Math.max(1, rect.height);

	canvas.width = Math.round(nextWidth * dpr);
	canvas.height = Math.round(nextHeight * dpr);

	context = canvas.getContext("2d");
	if (!context) return;

	context.setTransform(dpr, 0, 0, dpr, 0, 0);
	buildGrid(nextWidth, nextHeight);
}

function updatePoints(time: number) {
	const influenceRadius = Math.min(width, height) * POINTER_RADIUS_RATIO;
	const influenceStrength = Math.min(width, height) * POINTER_STRENGTH_RATIO;
	const pointerActive = pointer.active && !prefersCoarsePointer();

	for (const line of verticalLines) {
		for (const point of line) {
			const wave = getWaveOffset(point.bx, point.by, time);
			let targetX = point.bx + wave.dx;
			let targetY = point.by + wave.dy;

			if (pointerActive) {
				const dx = pointer.x - point.bx;
				const dy = pointer.y - point.by;
				const distance = Math.hypot(dx, dy);

				if (distance < influenceRadius) {
					const t = 1 - distance / influenceRadius;
					const force = t * t * t * influenceStrength;
					targetX += dx * force * POINTER_PULL;
					targetY += dy * force * POINTER_PULL;
				}
			}

			point.x += (targetX - point.x) * 0.08;
			point.y += (targetY - point.y) * 0.08;
		}
	}
}

function drawSmoothPolyline(
	context: CanvasRenderingContext2D,
	polyline: LinePoint[],
) {
	const count = polyline.length;
	if (count < 2) return;

	context.beginPath();
	context.moveTo(polyline[0].x, polyline[0].y);

	if (count === 2) {
		context.lineTo(polyline[1].x, polyline[1].y);
		context.stroke();
		return;
	}

	for (let i = 1; i < count - 1; i += 1) {
		const current = polyline[i];
		const next = polyline[i + 1];
		const midX = (current.x + next.x) / 2;
		const midY = (current.y + next.y) / 2;
		context.quadraticCurveTo(current.x, current.y, midX, midY);
	}

	const last = polyline[count - 1];
	const beforeLast = polyline[count - 2];
	context.quadraticCurveTo(beforeLast.x, beforeLast.y, last.x, last.y);
	context.stroke();
}

function drawLines() {
	if (!context || !canvas) return;

	context.clearRect(0, 0, width, height);
	context.strokeStyle = getLineStrokeColor();
	context.lineWidth = 1;
	context.lineCap = "round";
	context.lineJoin = "round";

	for (const line of verticalLines) {
		drawSmoothPolyline(context, line);
	}
}

function tick(now: number) {
	if (!running) return;

	updatePoints(now * 0.001);
	drawLines();
	animationFrame = requestAnimationFrame(tick);
}

function bindPointerEvents() {
	if (bound || !canvas) return;
	bound = true;

	const updatePointer = (event: PointerEvent) => {
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		pointer.x = event.clientX - rect.left;
		pointer.y = event.clientY - rect.top;
		pointer.active = true;
	};

	window.addEventListener(
		"pointermove",
		(event) => {
			if (!running || event.pointerType === "touch") return;
			updatePointer(event);
		},
		{ passive: true },
	);

	window.addEventListener(
		"pointerleave",
		() => {
			pointer.active = false;
		},
		{ passive: true },
	);
}

export function startBackgroundLines() {
	if (prefersReducedMotion()) return;

	canvas = getCanvas();
	if (!canvas || running) return;

	resizeCanvas();
	bindPointerEvents();
	running = true;
	animationFrame = requestAnimationFrame(tick);
}

export function stopBackgroundLines() {
	running = false;
	pointer.active = false;

	if (animationFrame) {
		cancelAnimationFrame(animationFrame);
		animationFrame = 0;
	}

	if (context && canvas) {
		context.clearRect(0, 0, width, height);
	}
}

export function resizeBackgroundLines() {
	if (!getCanvas()) return;
	resizeCanvas();
	if (running) {
		drawLines();
	}
}

export function initBackgroundLines() {
	resizeBackgroundLines();
}

let handledClientSwap = false;
let shellOpacity = 0;
let fadeFrame: number | null = null;
let fadeToken = 0;

function getShell() {
	return document.getElementById("background-lines-shell");
}

function applyShellOpacity(value: number) {
	const shell = getShell();
	shellOpacity = value;
	if (!shell) return;
	shell.style.opacity = String(value);
}

function easeOutCubic(progress: number) {
	return 1 - Math.pow(1 - progress, 3);
}

function stopFade() {
	fadeToken += 1;
	if (fadeFrame !== null) {
		cancelAnimationFrame(fadeFrame);
		fadeFrame = null;
	}
}

function prepareBackgroundLines() {
	initBackgroundLines();
	resizeBackgroundLines();
	startBackgroundLines();
}

function fadeBackgroundLinesIn(options?: { instant?: boolean }) {
	if (prefersReducedMotion()) return Promise.resolve();

	prepareBackgroundLines();

	if (options?.instant) {
		stopFade();
		applyShellOpacity(1);
		return Promise.resolve();
	}

	const token = ++fadeToken;

	return new Promise<void>((resolve) => {
		const shell = getShell();
		if (!shell) {
			shellOpacity = 1;
			resolve();
			return;
		}

		const from = shellOpacity;
		if (Math.abs(from - 1) < 0.005) {
			applyShellOpacity(1);
			resolve();
			return;
		}

		const start = performance.now();
		const durationMs = backgroundLinesFadeInTransitionMs;

		const tick = (now: number) => {
			if (token !== fadeToken) {
				resolve();
				return;
			}

			const progress = Math.min(1, (now - start) / durationMs);
			applyShellOpacity(from + (1 - from) * easeOutCubic(progress));

			if (progress < 1) {
				fadeFrame = requestAnimationFrame(tick);
				return;
			}

			fadeFrame = null;
			applyShellOpacity(1);
			resolve();
		};

		if (fadeFrame !== null) {
			cancelAnimationFrame(fadeFrame);
		}

		fadeFrame = requestAnimationFrame(tick);
	});
}

initBackgroundLines();

window.addEventListener("resize", () => {
	if (getCanvas()) {
		resizeBackgroundLines();
	}
});

document.addEventListener(TRANSITION_AFTER_SWAP, () => {
	handledClientSwap = true;
	stopFade();
	applyShellOpacity(0);
	prepareBackgroundLines();

	runAfterContentSlide(() => {
		void fadeBackgroundLinesIn();
	});
});

document.addEventListener("astro:page-load", () => {
	if (!handledClientSwap) {
		void fadeBackgroundLinesIn();
	}

	handledClientSwap = false;
	initBackgroundLines();
});
