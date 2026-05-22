const HEADER_SELECTOR = ".project-header";
const TOGGLE_SELECTOR = ".project-header__intro-toggle";
const EXPANDABLE_SELECTOR = ".project-header__expandable";
const INNER_SELECTOR = ".project-header__expandable-inner";

function expandDescription(header: HTMLElement, toggle: HTMLButtonElement) {
	if (header.classList.contains("is-description-expanded")) return;

	const expandable = header.querySelector(EXPANDABLE_SELECTOR);
	const inner = header.querySelector(INNER_SELECTOR);

	if (!(expandable instanceof HTMLElement) || !(inner instanceof HTMLElement)) {
		header.classList.add("is-description-expanded");
		toggle.setAttribute("aria-expanded", "true");
		return;
	}

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		header.classList.add("is-description-expanded");
		toggle.setAttribute("aria-expanded", "true");
		return;
	}

	const startHeight = expandable.getBoundingClientRect().height;

	expandable.style.height = `${startHeight}px`;
	expandable.style.overflow = "hidden";

	header.classList.add("is-description-expanded");
	toggle.setAttribute("aria-expanded", "true");

	void inner.offsetHeight;
	const endHeight = inner.scrollHeight;

	if (startHeight >= endHeight) {
		expandable.style.height = "";
		expandable.style.overflow = "";
		return;
	}

	requestAnimationFrame(() => {
		expandable.style.height = `${endHeight}px`;
	});

	const onTransitionEnd = (event: TransitionEvent) => {
		if (event.target !== expandable || event.propertyName !== "height") return;
		expandable.style.height = "";
		expandable.style.overflow = "";
		expandable.removeEventListener("transitionend", onTransitionEnd);
	};

	expandable.addEventListener("transitionend", onTransitionEnd);
}

function bindProjectHeader(header: HTMLElement) {
	const toggle = header.querySelector(TOGGLE_SELECTOR);
	if (!(toggle instanceof HTMLButtonElement)) return;
	if (toggle.dataset.bound === "true") return;

	toggle.dataset.bound = "true";

	toggle.addEventListener("click", () => {
		expandDescription(header, toggle);
	});
}

export function initProjectHeader(root: ParentNode = document) {
	root.querySelectorAll(HEADER_SELECTOR).forEach((node) => {
		if (node instanceof HTMLElement) {
			bindProjectHeader(node);
		}
	});
}

document.addEventListener("astro:page-load", () => {
	initProjectHeader();
});

initProjectHeader();
