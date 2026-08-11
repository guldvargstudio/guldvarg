const SCROLL_THRESHOLD = 8;

let scrollTarget: HTMLElement | null = null;
let scrollFrame = 0;

function getScrollRoot() {
	return document.getElementById("site-scroll");
}

function getScrollTop() {
	const root = getScrollRoot();
	return root?.scrollTop ?? window.scrollY;
}

function getSiteHeader() {
	return document.querySelector(".site-header");
}

function getSiteHeaderStack() {
	return document.getElementById("site-header-stack");
}

function syncSiteHeaderStack(header: Element, scrolled: boolean) {
	const stack = getSiteHeaderStack();
	if (!stack) return;

	const isDark = header.querySelector(".step-nav--dark") !== null;
	stack.classList.toggle("site-header-stack--scrolled", scrolled);
	stack.classList.toggle("site-header-stack--dark", isDark);
}

export function updateSiteHeaderScrollState() {
	const header = getSiteHeader();
	if (!header) return;

	const scrolled = getScrollTop() > SCROLL_THRESHOLD;
	header.classList.toggle("site-header--scrolled", scrolled);
	syncSiteHeaderStack(header, scrolled);
}

function scheduleSiteHeaderScrollUpdate() {
	if (scrollFrame) return;

	scrollFrame = requestAnimationFrame(() => {
		scrollFrame = 0;
		updateSiteHeaderScrollState();
	});
}

function bindSiteHeaderScroll() {
	const root = getScrollRoot();
	updateSiteHeaderScrollState();

	if (!root || root === scrollTarget) return;

	scrollTarget?.removeEventListener("scroll", scheduleSiteHeaderScrollUpdate);
	scrollTarget = root;
	root.addEventListener("scroll", scheduleSiteHeaderScrollUpdate, { passive: true });
}

function initSiteHeader() {
	bindSiteHeaderScroll();
}

initSiteHeader();

document.addEventListener("astro:page-load", initSiteHeader);
