import { contentTransitionDurationMs } from "../config/motion";
import { isInternalNavigationLink } from "../lib/navigation";
import { freezePageBgAtDisplayedColor } from "../lib/pageBackground";
import { storeNavDirection } from "../lib/slideNavigation";
import {
	findStepNavLinkAtPoint,
	isViewTransitionAnimating,
	skipActiveViewTransition,
} from "../lib/viewTransition";
import {
	computeStepNavLayout,
	computeVisibleDotWindow,
	getNavPosition,
	getWindowEdgeDotModifier,
	STEP_NAV_DOT_MODIFIER_CLASSES,
	type StepNavLayout,
} from "../lib/stepNavLayout";
import { getStepNavProjectCount, getStepNavStateFromLink, resolveNavDirection } from "../lib/stepNavDirection";
import {
	readStepNavVisualState,
	type StepNavVisualState,
} from "../lib/stepNavState";
import {
	isTransitionBeforeSwapEvent,
	navigate,
	TRANSITION_AFTER_SWAP,
	TRANSITION_BEFORE_SWAP,
} from "astro:transitions/client";

let pendingStepNavState: StepNavVisualState | null = null;
let stateObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let lastAppliedStateKey = "";
let lastLayoutKey = "";

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
	const projectCount = getStepNavProjectCount();
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
	const projectCount = getStepNavProjectCount();
	const layout = computeStepNavLayout(getCenterWidth(nav), projectCount);
	applyStepNavLayout(nav, state, layout);
}

function stateKey(state: StepNavVisualState): string {
	return `${state.active}:${state.activeDotIndex ?? ""}`;
}

function syncStepNavVariant(doc: Document = document) {
	const nav = document.querySelector(".step-nav");
	if (!nav) return;

	const stateElement = doc.getElementById("step-nav-state");
	const variant = stateElement instanceof HTMLElement ? stateElement.dataset.stepNavVariant : undefined;
	nav.classList.toggle("step-nav--dark", variant === "dark");
}

function applyStepNavVisualState(state: StepNavVisualState, force = false) {
	const nav = document.querySelector(".step-nav");
	if (!nav) return;

	const key = stateKey(state);
	if (!force && key === lastAppliedStateKey) {
		updateStepNavLayout(nav, state);
		syncStepNavVariant();
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

	nav.classList.remove("step-nav--home-hidden");
	nav.removeAttribute("inert");

	const projectCount = getStepNavProjectCount();
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
	syncStepNavVariant();
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

export function syncStepNavLinks(doc: Document = document) {
	const nav = document.querySelector(".step-nav");
	if (!nav) return;

	syncStepNavVariant(doc);

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
		attributeFilter: ["data-step-nav-active", "data-step-nav-dot", "data-step-nav-variant"],
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

function activateStepNavLink(link: HTMLAnchorElement) {
	const nextState = getStepNavStateFromLink(link);
	if (!nextState) return false;

	pendingStepNavState = nextState;
	applyStepNavVisualState(nextState, true);
	return true;
}

function resolveClickNavLink(event: MouseEvent) {
	const target = event.target;
	if (target instanceof Element) {
		const link = target.closest("a[href]");
		if (link instanceof HTMLAnchorElement) return link;
	}

	if (!isViewTransitionAnimating()) return null;
	return findStepNavLinkAtPoint(event.clientX, event.clientY);
}

function interruptTransitionNavigation(link: HTMLAnchorElement, event: Event) {
	if (!activateStepNavLink(link)) return;

	event.preventDefault();
	event.stopImmediatePropagation();

	skipActiveViewTransition();
	freezePageBgAtDisplayedColor();

	const direction = resolveNavDirection(link);
	if (direction) {
		storeNavDirection(direction);
	}

	void navigate(link.href);
}

document.addEventListener(
	"pointerdown",
	(event) => {
		if (!(event instanceof PointerEvent)) return;
		if (!isViewTransitionAnimating()) return;

		const link = findStepNavLinkAtPoint(event.clientX, event.clientY);
		if (!link || !isInternalNavigationLink(link)) return;

		interruptTransitionNavigation(link, event);
	},
	true,
);

document.addEventListener(
	"click",
	(event) => {
		if (!(event instanceof MouseEvent)) return;
		if (isViewTransitionAnimating()) return;

		const link = resolveClickNavLink(event);
		if (!link || !isInternalNavigationLink(link)) return;

		activateStepNavLink(link);
	},
	true,
);

document.addEventListener(TRANSITION_BEFORE_SWAP, (event) => {
	if (!isTransitionBeforeSwapEvent(event)) return;

	pendingStepNavState = readStepNavVisualState(event.newDocument);
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
