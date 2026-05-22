import {
	contentTransitionDurationCss,
	contentTransitionEasingCss,
} from "../config/motion";
import { getPageBgEnd } from "../data/projectBackground";
import { isInternalNavigationLink } from "../lib/navigation";
import {
	freezePageBgAtDisplayedColor,
	getFrozenPageBgEnd,
	getPageBgGradient,
	getDisplayedPageBgEnd,
	hasActiveColorAnimation,
	initPageBackground,
	lockAllPageBgLayerStyles,
	paintPageBgForTransition,
	pinFrozenPageBg,
	schedulePageBgEnd,
} from "../lib/pageBackground";
import { resolveNavDirection } from "../lib/stepNavDirection";
import { readStepNavVisualState, type StepNavVisualState } from "../lib/stepNavState";
import { commitStepNavState, syncStepNavLinks } from "./stepNav";
import {
	isTransitionBeforeSwapEvent,
	TRANSITION_AFTER_SWAP,
	TRANSITION_BEFORE_SWAP,
} from "astro:transitions/client";

const DURATION = contentTransitionDurationCss;
const EASING = contentTransitionEasingCss;
const DEFAULT_PAGE_BG_END = getPageBgEnd();

let pendingNavVisualState: StepNavVisualState | null = null;
let pendingPageBgEnd: string | null = null;
let handledByClientSwap = false;

function injectDirectionalSlide(newDocument: Document, direction: "prev" | "next") {
	const style = newDocument.createElement("style");
	style.dataset.navSlide = direction;
	const vtBackground = getPageBgGradient(getFrozenPageBgEnd());

	if (direction === "next") {
		style.textContent = `
			::view-transition {
				background: ${vtBackground};
			}
			::view-transition-old(root),
			::view-transition-new(root) {
				animation: none;
				opacity: 0;
			}
			::view-transition-old(main) {
				animation: ${DURATION} ${EASING} both slide-out-to-left;
			}
			::view-transition-new(main) {
				animation: ${DURATION} ${EASING} both slide-in-from-right;
			}
		`;
	} else {
		style.textContent = `
			::view-transition {
				background: ${vtBackground};
			}
			::view-transition-old(root),
			::view-transition-new(root) {
				animation: none;
				opacity: 0;
			}
			::view-transition-old(main) {
				animation: ${DURATION} ${EASING} both slide-out-to-right;
			}
			::view-transition-new(main) {
				animation: ${DURATION} ${EASING} both slide-in-from-left;
			}
		`;
	}

	newDocument.head.appendChild(style);
}

function applyPendingPageState() {
	const navState = pendingNavVisualState;
	const pageBgEnd = pendingPageBgEnd;
	pendingNavVisualState = null;
	pendingPageBgEnd = null;

	requestAnimationFrame(() => {
		if (navState) {
			commitStepNavState(navState, true);
		}

		if (pageBgEnd) {
			schedulePageBgEnd(pageBgEnd);
		}
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
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		freezePageBgAtDisplayedColor();

		const direction = resolveNavDirection(link);
		if (direction) {
			sessionStorage.setItem("nav-direction", direction);
		}
	},
	true,
);

document.addEventListener(TRANSITION_BEFORE_SWAP, (event) => {
	if (!isTransitionBeforeSwapEvent(event)) return;

	freezePageBgAtDisplayedColor();

	pendingNavVisualState = readStepNavVisualState(event.newDocument);
	pendingPageBgEnd = event.newDocument.body.dataset.pageBgEnd ?? null;
	syncStepNavLinks(event.newDocument);

	const direction = sessionStorage.getItem("nav-direction");
	sessionStorage.removeItem("nav-direction");

	if (direction === "prev" || direction === "next") {
		injectDirectionalSlide(event.newDocument, direction);
	}
});

document.addEventListener(TRANSITION_AFTER_SWAP, () => {
	handledByClientSwap = true;
	const frozenEnd = getFrozenPageBgEnd();
	lockAllPageBgLayerStyles();
	paintPageBgForTransition(frozenEnd);

	requestAnimationFrame(() => {
		lockAllPageBgLayerStyles();
		paintPageBgForTransition(frozenEnd);
	});

	applyPendingPageState();
});

document.addEventListener("astro:page-load", () => {
	if (handledByClientSwap) {
		handledByClientSwap = false;
		return;
	}

	const endColor = document.body.dataset.pageBgEnd;

	requestAnimationFrame(() => {
		if (hasActiveColorAnimation()) {
			return;
		}

		if (endColor && endColor !== getDisplayedPageBgEnd()) {
			schedulePageBgEnd(endColor);
			return;
		}

		pinFrozenPageBg();
	});
});

initPageBackground(DEFAULT_PAGE_BG_END);
