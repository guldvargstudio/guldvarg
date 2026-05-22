import { contentTransitionDurationMs } from "../config/motion";
import {
	computeStepNavLayout,
	computeVisibleDotWindow,
	getNavPosition,
	getWindowEdgeDotModifier,
	STEP_NAV_DOT_MODIFIER_CLASSES,
	type StepNavLayout,
} from "../lib/stepNavLayout";
import {
	readStepNavVisualState,
	type StepNavVisualState,
} from "../lib/stepNavState";
import {
	isTransitionBeforeSwapEvent,
	TRANSITION_AFTER_SWAP,
	TRANSITION_BEFORE_SWAP,
} from "astro:transitions/client";

function isInternalNavigationLink(link: HTMLAnchorElement) {
	const url = new URL(link.href, window.location.origin);
	return url.origin === window.location.origin;
}

let pendingStepNavState: StepNavVisualState | null = null;
let stateObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let lastAppliedStateKey = "";
let lastLayoutKey = "";

function getProjectDotCount(nav: Element): number {
	const dotsContainer = nav.querySelector(".step-nav__dots");

	if (dotsContainer instanceof HTMLElement && dotsContainer.dataset.dotCount) {
		const count = Number(dotsContainer.dataset.dotCount);
		if (Number.isFinite(count)) return count;
	}

	return nav.querySelectorAll('.step-nav__dot:not(.step-nav__dot--endpoint)').length;
}

function getCenterWidth(nav: Element): number {
	const inner = nav.querySelector(".step-nav__inner");
	if (!(inner instanceof HTMLElement)) return 0;

	return inner.clientWidth - 72 - 48;
}

function clearDotModifierClasses(dot: Element) {
	for (const className of STEP_NAV_DOT_MODIFIER_CLASSES) {
		dot.classList.remove(className);
	}
}

function applyStepNavLayout(nav: Element, state: StepNavVisualState, layout: StepNavLayout) {
	const projectCount = getProjectDotCount(nav);
	const activePosition = getNavPosition(state, projectCount);
	const layoutKey = `${layout.mode}:${layout.gap}:${layout.compact}:${layout.maxVisible}:${activePosition}:${getCenterWidth(nav)}`;
	if (layoutKey === lastLayoutKey) return;
	lastLayoutKey = layoutKey;

	const inner = nav.querySelector(".step-nav__inner");
	if (inner instanceof HTMLElement) {
		inner.style.setProperty("--step-nav-gap", `${layout.gap}px`);
	}

	nav.classList.toggle("step-nav--dots-only", layout.mode === "dots-only");
	nav.classList.toggle("step-nav--compact", layout.compact);

	const dots = nav.querySelectorAll(".step-nav__dot");
	const totalDots = projectCount + 2;
	const window = layout.compact
		? computeVisibleDotWindow(activePosition, totalDots, layout.maxVisible)
		: null;

	dots.forEach((dot) => {
		clearDotModifierClasses(dot);

		if (!window) return;

		const navPosition = Number((dot as HTMLElement).dataset.navPosition);
		if (!Number.isFinite(navPosition)) return;

		const modifier = getWindowEdgeDotModifier(
			navPosition,
			activePosition,
			window,
			totalDots,
		);

		if (modifier) dot.classList.add(modifier);
	});
}

function updateStepNavLayout(nav: Element, state: StepNavVisualState) {
	const projectCount = getProjectDotCount(nav);
	const layout = computeStepNavLayout(getCenterWidth(nav), projectCount);
	applyStepNavLayout(nav, state, layout);
}

function stateKey(state: StepNavVisualState): string {
	return `${state.active}:${state.activeDotIndex ?? ""}`;
}

export function applyStepNavVisualState(state: StepNavVisualState, force = false) {
	const nav = document.querySelector(".step-nav");
	if (!nav) return;

	const key = stateKey(state);
	if (!force && key === lastAppliedStateKey) {
		updateStepNavLayout(nav, state);
		return;
	}
	lastAppliedStateKey = key;

	const homeLabel = nav.querySelector('.step-nav__label[href="/"]');
	const aboutLabel = nav.querySelector('.step-nav__label[href="/about"]');

	if (homeLabel instanceof HTMLElement) {
		homeLabel.classList.toggle("step-nav__label--active", state.active === "home");
	}

	if (aboutLabel instanceof HTMLElement) {
		aboutLabel.classList.toggle("step-nav__label--active", state.active === "about");
	}

	const hidden = state.active === "home";
	nav.classList.toggle("step-nav--home-hidden", hidden);

	if (hidden) {
		nav.setAttribute("inert", "");
	} else {
		nav.removeAttribute("inert");
	}

	const projectCount = getProjectDotCount(nav);
	const activePosition = getNavPosition(state, projectCount);

	nav.querySelectorAll(".step-nav__dot").forEach((dot) => {
		const navPosition = Number((dot as HTMLElement).dataset.navPosition);
		const isActive = Number.isFinite(navPosition) && navPosition === activePosition;

		dot.classList.toggle("step-nav__dot--active", isActive);

		if (isActive) {
			dot.setAttribute("aria-current", "page");
		} else {
			dot.removeAttribute("aria-current");
		}
	});

	updateStepNavLayout(nav, state);
}

function setPendingStepNavState(state: StepNavVisualState) {
	pendingStepNavState = state;
}

function resolveStepNavState(): StepNavVisualState {
	return pendingStepNavState ?? readStepNavVisualState();
}

export function commitStepNavState(override?: StepNavVisualState, force = false) {
	if (force) {
		lastAppliedStateKey = "";
		lastLayoutKey = "";
	}
	applyStepNavVisualState(override ?? resolveStepNavState(), force);
}

function scheduleStepNavCommits() {
	commitStepNavState();

	requestAnimationFrame(() => {
		commitStepNavState();
		requestAnimationFrame(() => commitStepNavState());
	});

	window.setTimeout(commitStepNavState, 0);
	window.setTimeout(commitStepNavState, 50);
	window.setTimeout(
		() => commitStepNavState(undefined, true),
		contentTransitionDurationMs + 50,
	);
}

export function syncStepNavFromDocument(doc: Document = document) {
	const state = doc.getElementById("step-nav-state")
		? readStepNavVisualState(doc)
		: pendingStepNavState;

	if (state) {
		setPendingStepNavState(state);
		applyStepNavVisualState(state);
	}
}

export function syncStepNavLinks(doc: Document = document) {
	const nav = document.querySelector(".step-nav");
	if (!nav) return;

	const stateElement = doc.getElementById("step-nav-state");
	const source = stateElement instanceof HTMLElement ? stateElement : doc.body;
	const { stepNavPrev, stepNavNext } = source.dataset;

	const prevBtn = nav.querySelector(".step-nav__btn:not(.step-nav__btn--next)");
	const nextBtn = nav.querySelector(".step-nav__btn--next");

	if (prevBtn instanceof HTMLAnchorElement && stepNavPrev) {
		prevBtn.href = stepNavPrev;
	}

	if (nextBtn instanceof HTMLAnchorElement && stepNavNext) {
		nextBtn.href = stepNavNext;
	}
}

function parseNavStateFromLink(link: HTMLAnchorElement, nav: Element): StepNavVisualState | null {
	const url = new URL(link.href, window.location.origin);
	const path = url.pathname.replace(/\/$/, "") || "/";

	if (path === "/") {
		return { active: "home" };
	}

	if (path === "/about") {
		return { active: "about" };
	}

	if (link.classList.contains("step-nav__dot")) {
		const navPosition = Number(link.dataset.navPosition);
		if (navPosition === 0) return { active: "home" };

		const projectCount = getProjectDotCount(nav);
		if (navPosition === projectCount + 1) return { active: "about" };

		const index = Number(link.dataset.dotIndex);
		if (Number.isFinite(index)) {
			return { active: "project", activeDotIndex: index };
		}
	}

	const dot = nav.querySelector<HTMLAnchorElement>(
		`.step-nav__dot[href="${url.pathname}"], .step-nav__dot[href="${path}"], .step-nav__dot[href="${path}/"]`,
	);

	if (dot) {
		const navPosition = Number(dot.dataset.navPosition);
		if (navPosition === 0) return { active: "home" };

		const projectCount = getProjectDotCount(nav);
		if (navPosition === projectCount + 1) return { active: "about" };

		const index = Number(dot.dataset.dotIndex);
		if (Number.isFinite(index)) {
			return { active: "project", activeDotIndex: index };
		}
	}

	return null;
}

function observeStepNavStateElement() {
	stateObserver?.disconnect();

	const stateElement = document.getElementById("step-nav-state");
	if (!stateElement) return;

	stateObserver = new MutationObserver(() => {
		pendingStepNavState = null;
		lastAppliedStateKey = "";
		lastLayoutKey = "";
		commitStepNavState();
	});

	stateObserver.observe(stateElement, {
		attributes: true,
		attributeFilter: ["data-step-nav-active", "data-step-nav-dot"],
	});
}

function observeStepNavResize() {
	resizeObserver?.disconnect();

	const inner = document.querySelector(".step-nav__inner");
	if (!(inner instanceof HTMLElement)) return;

	resizeObserver = new ResizeObserver(() => {
		lastLayoutKey = "";
		const nav = document.querySelector(".step-nav");
		if (!nav) return;
		updateStepNavLayout(nav, resolveStepNavState());
	});

	resizeObserver.observe(inner);
}

function initStepNav() {
	commitStepNavState(undefined, true);
	observeStepNavStateElement();
	observeStepNavResize();
}

document.addEventListener(
	"click",
	(event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const link = target.closest("a[href]");
		if (!(link instanceof HTMLAnchorElement)) return;
		if (!isInternalNavigationLink(link)) return;

		const nav = document.querySelector(".step-nav");
		if (!nav) return;

		const nextState = parseNavStateFromLink(link, nav);
		if (!nextState) return;

		setPendingStepNavState(nextState);
		applyStepNavVisualState(nextState, true);
	},
	true,
);

document.addEventListener(TRANSITION_BEFORE_SWAP, (event) => {
	if (!isTransitionBeforeSwapEvent(event)) return;

	const state = readStepNavVisualState(event.newDocument);
	setPendingStepNavState(state);
	syncStepNavLinks(event.newDocument);
});

document.addEventListener(TRANSITION_AFTER_SWAP, () => {
	pendingStepNavState = null;
	lastAppliedStateKey = "";
	lastLayoutKey = "";
	syncStepNavLinks();
	scheduleStepNavCommits();
	observeStepNavStateElement();
	observeStepNavResize();
});

document.addEventListener("astro:page-load", () => {
	pendingStepNavState = null;
	lastAppliedStateKey = "";
	lastLayoutKey = "";
	syncStepNavLinks();
	commitStepNavState(undefined, true);
	observeStepNavStateElement();
	observeStepNavResize();
});

initStepNav();
