import { readStepNavVisualState, type StepNavVisualState } from "./stepNavState";

/** Linear nav order: Home → dot 0 → … → dot n-1 → About */
export function getStepNavDotCount(doc: Document = document): number {
	const dotsContainer = doc.querySelector(".step-nav__dots");

	if (dotsContainer instanceof HTMLElement && dotsContainer.dataset.dotCount) {
		const count = Number(dotsContainer.dataset.dotCount);
		if (Number.isFinite(count)) return count;
	}

	return doc.querySelectorAll(".step-nav__dot").length;
}

export function getNavPosition(
	state: StepNavVisualState,
	dotCount: number,
): number {
	if (state.active === "home") return 0;
	if (state.active === "about") return dotCount + 1;
	return (state.activeDotIndex ?? 0) + 1;
}

function normalizePath(pathname: string): string {
	return pathname.replace(/\/$/, "") || "/";
}

export function getLinkNavPosition(
	link: HTMLAnchorElement,
	dotCount: number,
	doc: Document = document,
): number | null {
	const path = normalizePath(new URL(link.href).pathname);

	if (path === "/") return 0;
	if (path === "/about") return dotCount + 1;

	if (link.classList.contains("step-nav__dot")) {
		const navPosition = Number(link.dataset.navPosition);
		if (Number.isFinite(navPosition)) return navPosition;

		const index = Number(link.dataset.dotIndex);
		if (Number.isFinite(index)) return index + 1;
	}

	const dot = doc.querySelector<HTMLAnchorElement>(
		`.step-nav__dot[href="${path}"], .step-nav__dot[href="${path}/"]`,
	);

	if (dot) {
		const navPosition = Number(dot.dataset.navPosition);
		if (Number.isFinite(navPosition)) return navPosition;

		const index = Number(dot.dataset.dotIndex);
		if (Number.isFinite(index)) return index + 1;
	}

	return null;
}

export function resolveNavDirection(
	link: HTMLAnchorElement,
	doc: Document = document,
): "prev" | "next" | null {
	const explicit = link.dataset.navDirection;
	if (explicit === "prev" || explicit === "next") {
		return explicit;
	}

	const dotCount = getStepNavDotCount(doc);
	const targetPosition = getLinkNavPosition(link, dotCount, doc);
	if (targetPosition === null) return null;

	const currentPosition = getNavPosition(readStepNavVisualState(doc), dotCount);
	if (targetPosition === currentPosition) return null;

	return targetPosition > currentPosition ? "next" : "prev";
}
