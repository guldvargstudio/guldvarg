import { contentTransitionDurationMs } from "../config/motion";
import {
	getDotDistance,
	getDotModifier,
	STEP_NAV_COMPACT_MAX_WIDTH,
	STEP_NAV_DOT_MODIFIER_CLASSES,
} from "../lib/stepNavCompact";
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

const compactQuery = window.matchMedia(`(max-width: ${STEP_NAV_COMPACT_MAX_WIDTH}px)`);

let pendingStepNavState: StepNavVisualState | null = null;
let stateObserver: MutationObserver | null = null;
let lastAppliedStateKey = "";

function stateKey(state: StepNavVisualState): string {
	return `${state.active}:${state.activeDotIndex ?? ""}:${compactQuery.matches}`;
}

function clearDotModifierClasses(dot: Element) {
	for (const className of STEP_NAV_DOT_MODIFIER_CLASSES) {
		dot.classList.remove(className);
	}
}

export function updateStepNavCompact(state: StepNavVisualState) {
	const nav = document.querySelector(".step-nav");
	if (!nav) return;

	const isCompact = compactQuery.matches;

	nav.classList.toggle("step-nav--compact", isCompact);

	const dots = nav.querySelectorAll(".step-nav__dot");
	const dotCount = dots.length;

	dots.forEach((dot, index) => {
		clearDotModifierClasses(dot);

		if (!isCompact) return;

		if (dot.classList.contains("step-nav__dot--active")) return;

		const distance = getDotDistance(
			index,
			state.active,
			state.activeDotIndex,
			dotCount,
		);

		dot.classList.add(getDotModifier(distance));
	});

	if (!isCompact) return;

	const dotsContainer = nav.querySelector(".step-nav__dots");
	const activeDot = nav.querySelector(".step-nav__dot--active");

	if (activeDot && dotsContainer instanceof HTMLElement) {
		activeDot.scrollIntoView({ inline: "nearest", block: "nearest" });
	}
}

export function applyStepNavVisualState(state: StepNavVisualState) {
	const nav = document.querySelector(".step-nav");
	if (!nav) return;

	const key = stateKey(state);
	if (key === lastAppliedStateKey) return;
	lastAppliedStateKey = key;

	const homeLabel = nav.querySelector('.step-nav__label[href="/"]');
	const aboutLabel = nav.querySelector('.step-nav__label[href="/about"]');

	if (homeLabel instanceof HTMLElement) {
		homeLabel.classList.toggle("step-nav__label--active", state.active === "home");
	}

	if (aboutLabel instanceof HTMLElement) {
		aboutLabel.classList.toggle("step-nav__label--active", state.active === "about");
	}

	nav.querySelectorAll(".step-nav__dot").forEach((dot, index) => {
		const isActive =
			state.active === "project" && state.activeDotIndex === index;

		dot.classList.toggle("step-nav__dot--active", isActive);

		if (isActive) {
			dot.setAttribute("aria-current", "page");
		} else {
			dot.removeAttribute("aria-current");
		}
	});

	updateStepNavCompact(state);
}

function setPendingStepNavState(state: StepNavVisualState) {
	pendingStepNavState = state;
}

function resolveStepNavState(): StepNavVisualState {
	return pendingStepNavState ?? readStepNavVisualState();
}

export function commitStepNavState(override?: StepNavVisualState, force = false) {
	if (force) lastAppliedStateKey = "";
	const state = override ?? resolveStepNavState();
	applyStepNavVisualState(state);
}

function scheduleStepNavCommits() {
	commitStepNavState();

	requestAnimationFrame(() => {
		commitStepNavState();
		requestAnimationFrame(commitStepNavState);
	});

	window.setTimeout(commitStepNavState, 0);
	window.setTimeout(commitStepNavState, 50);
	window.setTimeout(() => commitStepNavState(undefined, true), contentTransitionDurationMs + 50);
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

	const dot = nav.querySelector<HTMLAnchorElement>(
		`.step-nav__dot[href="${url.pathname}"], .step-nav__dot[href="${path}"], .step-nav__dot[href="${path}/"]`,
	);

	if (dot?.dataset.dotIndex !== undefined) {
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
		commitStepNavState();
	});

	stateObserver.observe(stateElement, {
		attributes: true,
		attributeFilter: ["data-step-nav-active", "data-step-nav-dot"],
	});
}

function initStepNav() {
	commitStepNavState();
	observeStepNavStateElement();

	compactQuery.addEventListener("change", () => {
		lastAppliedStateKey = "";
		commitStepNavState();
	});
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
		applyStepNavVisualState(nextState);
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
	syncStepNavLinks();
	scheduleStepNavCommits();
	observeStepNavStateElement();
});

document.addEventListener("astro:page-load", () => {
	pendingStepNavState = null;
	lastAppliedStateKey = "";
	syncStepNavLinks();
	scheduleStepNavCommits();
	observeStepNavStateElement();
});

initStepNav();
