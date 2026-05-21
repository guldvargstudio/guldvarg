import { contentTransitionDurationMs } from "../config/motion";

const SLIDE_IN_ANIMATION_NAMES = new Set(["slide-in-from-right", "slide-in-from-left"]);

function isSlideAnimationEvent(event: AnimationEvent) {
	return typeof event.animationName === "string" && SLIDE_IN_ANIMATION_NAMES.has(event.animationName);
}

function getSlideAnimationName(animation: Animation) {
	if ("animationName" in animation && typeof animation.animationName === "string") {
		return animation.animationName;
	}

	return null;
}

function getActiveSlideAnimations() {
	return document.getAnimations().filter((animation) => {
		const name = getSlideAnimationName(animation);
		return name !== null && SLIDE_IN_ANIMATION_NAMES.has(name);
	});
}

export function runAfterContentSlide(task: () => void) {
	let settled = false;

	const finish = () => {
		if (settled) return;
		settled = true;
		document.removeEventListener("animationend", onAnimationEnd, true);
		window.clearTimeout(fallbackTimer);
		task();
	};

	const onAnimationEnd = (event: Event) => {
		if (!(event instanceof AnimationEvent)) return;
		if (!isSlideAnimationEvent(event)) return;
		finish();
	};

	document.addEventListener("animationend", onAnimationEnd, true);
	const fallbackTimer = window.setTimeout(finish, contentTransitionDurationMs + 50);

	void (async () => {
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		const slideAnimations = getActiveSlideAnimations();
		if (slideAnimations.length === 0) return;

		try {
			await Promise.all(slideAnimations.map((animation) => animation.finished));
			finish();
		} catch {
			/* animation aborted */
		}
	})();
}
