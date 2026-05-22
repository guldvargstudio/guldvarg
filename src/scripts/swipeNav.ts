import { navigateWithDirection } from "../lib/slideNavigation";

const MOBILE_QUERY = window.matchMedia("(max-width: 768px)");
const SWIPE_THRESHOLD_PX = 56;
const MAX_VERTICAL_DRIFT_PX = 72;

let touchStartX = 0;
let touchStartY = 0;
let tracking = false;

function isInteractiveTarget(target: EventTarget | null) {
	return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select, label"));
}

function onTouchStart(event: TouchEvent) {
	if (!MOBILE_QUERY.matches) return;
	if (event.touches.length !== 1) return;
	if (isInteractiveTarget(event.target)) return;

	touchStartX = event.touches[0].clientX;
	touchStartY = event.touches[0].clientY;
	tracking = true;
}

function onTouchEnd(event: TouchEvent) {
	if (!tracking) return;
	tracking = false;

	const touch = event.changedTouches[0];
	const deltaX = touch.clientX - touchStartX;
	const deltaY = touch.clientY - touchStartY;

	if (Math.abs(deltaY) > MAX_VERTICAL_DRIFT_PX) return;
	if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

	navigateWithDirection(deltaX < 0 ? "next" : "prev");
}

function onTouchCancel() {
	tracking = false;
}

document.addEventListener("touchstart", onTouchStart, { passive: true });
document.addEventListener("touchend", onTouchEnd, { passive: true });
document.addEventListener("touchcancel", onTouchCancel, { passive: true });
