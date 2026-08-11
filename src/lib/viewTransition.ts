const SLIDE_ANIMATION_NAMES = new Set([
	"slide-in-from-right",
	"slide-in-from-left",
	"slide-out-to-left",
	"slide-out-to-right",
]);

interface DocumentWithViewTransition extends Document {
	activeViewTransition?: ViewTransition | null;
}

function getSlideAnimationName(animation: Animation) {
	if ("animationName" in animation && typeof animation.animationName === "string") {
		return animation.animationName;
	}

	return null;
}

export function isViewTransitionAnimating() {
	const doc = document as DocumentWithViewTransition;
	if (doc.activeViewTransition) {
		return true;
	}

	return document.getAnimations().some((animation) => {
		const name = getSlideAnimationName(animation);
		return name !== null && SLIDE_ANIMATION_NAMES.has(name);
	});
}

export function skipActiveViewTransition() {
	const doc = document as DocumentWithViewTransition;
	doc.activeViewTransition?.skipTransition();
}

export function findStepNavLinkAtPoint(x: number, y: number) {
	const nav = document.querySelector(".step-nav");
	if (!(nav instanceof HTMLElement)) return null;

	for (const link of nav.querySelectorAll("a[href]")) {
		if (!(link instanceof HTMLAnchorElement)) continue;

		const rect = link.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) continue;
		if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
			return link;
		}
	}

	return null;
}
