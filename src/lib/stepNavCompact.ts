import type { StepNavVisualState } from "./stepNavState";

export const STEP_NAV_COMPACT_MAX_WIDTH = 768;

export const STEP_NAV_DOT_MODIFIER_CLASSES = [
	"step-nav__dot--s8",
	"step-nav__dot--s6",
	"step-nav__dot--s4",
	"step-nav__dot--hidden",
] as const;

export type StepNavDotModifier = (typeof STEP_NAV_DOT_MODIFIER_CLASSES)[number];

/** Distance from the visual anchor (active dot, or Home/About edge). */
export function getDotDistance(
	index: number,
	active: StepNavVisualState["active"],
	activeDotIndex: number | undefined,
	dotCount: number,
): number {
	if (active === "project" && activeDotIndex !== undefined) {
		return Math.abs(index - activeDotIndex);
	}

	if (active === "about") {
		return dotCount - 1 - index;
	}

	return index;
}

export function getDotModifier(distance: number): StepNavDotModifier {
	if (distance <= 2) return "step-nav__dot--s8";
	if (distance === 3) return "step-nav__dot--s6";
	if (distance === 4) return "step-nav__dot--s4";
	return "step-nav__dot--hidden";
}
