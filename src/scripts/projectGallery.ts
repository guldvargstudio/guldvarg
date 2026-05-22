const IMAGE_SELECTOR = ".project-gallery__image";

function revealImage(image: HTMLImageElement) {
	if (image.classList.contains("is-revealed")) return;

	requestAnimationFrame(() => {
		image.classList.add("is-revealed");
	});
}

function bindGalleryImage(image: HTMLImageElement) {
	if (image.dataset.revealBound === "true") return;
	image.dataset.revealBound = "true";

	if (image.complete) {
		revealImage(image);
		return;
	}

	image.addEventListener("load", () => revealImage(image), { once: true });
	image.addEventListener("error", () => revealImage(image), { once: true });
}

function initProjectGallery(root: ParentNode = document) {
	const gallery = root.querySelector(".project-gallery");
	if (!gallery) return;

	gallery.querySelectorAll(IMAGE_SELECTOR).forEach((node) => {
		if (node instanceof HTMLImageElement) {
			bindGalleryImage(node);
		}
	});
}

document.addEventListener("astro:page-load", () => {
	initProjectGallery();
});

initProjectGallery();
