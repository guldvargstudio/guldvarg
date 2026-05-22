import { navigate } from "astro:transitions/client";
import { freezePageBgAtDisplayedColor } from "./pageBackground";

export function getStepNavHref(direction: "prev" | "next"): string | null {
	const state = document.getElementById("step-nav-state");
	if (!(state instanceof HTMLElement)) return null;

	const href = direction === "prev" ? state.dataset.stepNavPrev : state.dataset.stepNavNext;
	return href || null;
}

export function storeNavDirection(direction: "prev" | "next") {
	if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		sessionStorage.setItem("nav-direction", direction);
	}
}

export function navigateWithDirection(direction: "prev" | "next") {
	const href = getStepNavHref(direction);
	if (!href) return;

	const targetPath = new URL(href, window.location.origin).pathname.replace(/\/$/, "") || "/";
	const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
	if (targetPath === currentPath) return;

	freezePageBgAtDisplayedColor();
	storeNavDirection(direction);
	void navigate(href);
}
