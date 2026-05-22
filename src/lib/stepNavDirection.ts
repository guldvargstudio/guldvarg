import { getNavPosition } from "./stepNavLayout";
import { readStepNavVisualState, type StepNavVisualState } from "./stepNavState";

export function getStepNavProjectCount(doc: Document = document): number {
	const dotsContainer = doc.querySelector(".step-nav__dots");

	if (dotsContainer instanceof HTMLElement && dotsContainer.dataset.dotCount) {
		const count = Number(dotsContainer.dataset.dotCount);
		if (Number.isFinite(count)) return count;
	}

	const nav = doc.querySelector(".step-nav");
	if (!nav) return 0;

	return nav.querySelectorAll(".step-nav__dot:not(.step-nav__dot--endpoint)").length;
}

function normalizePath(pathname: string): string {
	return pathname.replace(/\/$/, "") || "/";
}

export function getLinkNavPosition(
	link: HTMLAnchorElement,
	projectCount: number,
	doc: Document = document,
): number | null {
	const path = normalizePath(new URL(link.href).pathname);

	if (path === "/") return 0;
	if (path === "/about") return projectCount + 1;

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

export function getStepNavStateFromLink(
	link: HTMLAnchorElement,
	doc: Document = document,
): StepNavVisualState | null {
	const projectCount = getStepNavProjectCount(doc);
	const position = getLinkNavPosition(link, projectCount, doc);
	if (position === null) return null;
	if (position === 0) return { active: "home" };
	if (position === projectCount + 1) return { active: "about" };
	return { active: "project", activeDotIndex: position - 1 };
}

export function resolveNavDirection(
	link: HTMLAnchorElement,
	doc: Document = document,
): "prev" | "next" | null {
	const explicit = link.dataset.navDirection;
	if (explicit === "prev" || explicit === "next") {
		return explicit;
	}

	const projectCount = getStepNavProjectCount(doc);
	const targetPosition = getLinkNavPosition(link, projectCount, doc);
	if (targetPosition === null) return null;

	const currentPosition = getNavPosition(readStepNavVisualState(doc), projectCount);
	if (targetPosition === currentPosition) return null;

	return targetPosition > currentPosition ? "next" : "prev";
}
