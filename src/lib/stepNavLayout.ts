import type { StepNavVisualState } from "./stepNavState";

const STEP_NAV_GAP_MIN = 12;
const STEP_NAV_GAP_MAX = 16;
const STEP_NAV_DOT_SLOT = 16;
const STEP_NAV_LABELS_WIDTH = 104;
const STEP_NAV_EDGE_ANCHOR = 4;

export const STEP_NAV_DOT_MODIFIER_CLASSES = [
	"step-nav__dot--s6",
	"step-nav__dot--s4",
	"step-nav__dot--s2",
	"step-nav__dot--hidden",
] as const;

type StepNavDotModifier = (typeof STEP_NAV_DOT_MODIFIER_CLASSES)[number];
type DotWindow = { start: number; end: number };
type StepNavLayoutMode = "wide" | "dots-only";

export type StepNavLayout = {
	mode: StepNavLayoutMode;
	gap: number;
	compact: boolean;
	maxVisible: number;
};

const SHRINK_PRIORITY: Record<
	Exclude<StepNavDotModifier, "step-nav__dot--hidden">,
	number
> = {
	"step-nav__dot--s2": 0,
	"step-nav__dot--s4": 1,
	"step-nav__dot--s6": 2,
};

export function getNavPosition(
	state: StepNavVisualState,
	projectCount: number,
): number {
	if (state.active === "home") return 0;
	if (state.active === "about") return projectCount + 1;
	return (state.activeDotIndex ?? 0) + 1;
}

export function computeMaxVisibleDots(centerWidth: number, gap = STEP_NAV_GAP_MIN): number {
	return Math.max(
		1,
		Math.floor((centerWidth + gap) / (STEP_NAV_DOT_SLOT + gap)),
	);
}

export function computeGapForDotCount(centerWidth: number, dotCount: number): number {
	if (dotCount <= 1) return STEP_NAV_GAP_MIN;

	const gap = (centerWidth - dotCount * STEP_NAV_DOT_SLOT) / (dotCount - 1);
	return Math.max(STEP_NAV_GAP_MIN, Math.min(STEP_NAV_GAP_MAX, gap));
}

export function computeVisibleDotWindow(
	activePosition: number,
	totalDots: number,
	windowSize: number,
): DotWindow {
	if (windowSize >= totalDots) {
		return { start: 0, end: totalDots - 1 };
	}

	const anchorCount = Math.min(STEP_NAV_EDGE_ANCHOR, windowSize);
	const endAnchorStart = totalDots - anchorCount;

	if (activePosition < anchorCount) {
		return { start: 0, end: windowSize - 1 };
	}

	if (activePosition >= endAnchorStart) {
		return { start: totalDots - windowSize, end: totalDots - 1 };
	}

	let start = activePosition - Math.floor((windowSize - 1) / 2);
	let end = start + windowSize - 1;

	if (start < 0) {
		end -= start;
		start = 0;
	}

	if (end >= totalDots) {
		start -= end - (totalDots - 1);
		end = totalDots - 1;
	}

	return { start: Math.max(0, start), end };
}

function getEdgeShrinkModifier(offsetFromEdge: number): StepNavDotModifier | null {
	if (offsetFromEdge === 0) return "step-nav__dot--s2";
	if (offsetFromEdge === 1) return "step-nav__dot--s4";
	if (offsetFromEdge === 2) return "step-nav__dot--s6";
	return null;
}

function pickStrongestShrink(modifiers: StepNavDotModifier[]): StepNavDotModifier {
	return modifiers.reduce((strongest, modifier) =>
		SHRINK_PRIORITY[modifier as keyof typeof SHRINK_PRIORITY] <
		SHRINK_PRIORITY[strongest as keyof typeof SHRINK_PRIORITY]
			? modifier
			: strongest,
	);
}

export function getWindowEdgeDotModifier(
	navPosition: number,
	activePosition: number,
	window: DotWindow,
	totalDots: number,
): StepNavDotModifier | null {
	if (navPosition < window.start || navPosition > window.end) {
		return "step-nav__dot--hidden";
	}

	if (navPosition === activePosition) return null;

	const truncatedLeft = window.start > 0;
	const truncatedRight = window.end < totalDots - 1;
	const shrinkModifiers: StepNavDotModifier[] = [];

	if (truncatedLeft) {
		const offsetFromLeft = navPosition - window.start;
		const modifier = getEdgeShrinkModifier(offsetFromLeft);
		if (modifier) shrinkModifiers.push(modifier);
	}

	if (truncatedRight) {
		const offsetFromRight = window.end - navPosition;
		const modifier = getEdgeShrinkModifier(offsetFromRight);
		if (modifier) shrinkModifiers.push(modifier);
	}

	if (shrinkModifiers.length === 0) return null;

	return pickStrongestShrink(shrinkModifiers);
}

export function computeStepNavLayout(
	centerWidth: number,
	projectCount: number,
): StepNavLayout {
	const labelGapSlots = projectCount + 1;
	const needWithLabels =
		STEP_NAV_LABELS_WIDTH +
		projectCount * STEP_NAV_DOT_SLOT +
		labelGapSlots * STEP_NAV_GAP_MIN;

	const totalDots = projectCount + 2;
	const needDotsOnly =
		totalDots * STEP_NAV_DOT_SLOT + (totalDots - 1) * STEP_NAV_GAP_MIN;

	if (centerWidth >= needWithLabels) {
		const gap = Math.min(
			STEP_NAV_GAP_MAX,
			(centerWidth -
				STEP_NAV_LABELS_WIDTH -
				projectCount * STEP_NAV_DOT_SLOT) /
				labelGapSlots,
		);

		return {
			mode: "wide",
			gap: Math.max(STEP_NAV_GAP_MIN, gap),
			compact: false,
			maxVisible: projectCount,
		};
	}

	if (centerWidth >= needDotsOnly) {
		const gap = Math.min(
			STEP_NAV_GAP_MAX,
			(centerWidth - totalDots * STEP_NAV_DOT_SLOT) / (totalDots - 1),
		);

		return {
			mode: "dots-only",
			gap: Math.max(STEP_NAV_GAP_MIN, gap),
			compact: false,
			maxVisible: totalDots,
		};
	}

	const maxVisible = Math.min(totalDots, computeMaxVisibleDots(centerWidth));

	return {
		mode: "dots-only",
		gap: computeGapForDotCount(centerWidth, maxVisible),
		compact: true,
		maxVisible,
	};
}
