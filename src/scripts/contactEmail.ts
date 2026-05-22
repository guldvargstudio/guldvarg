function getContactEmail() {
	return ["kristofer", "guldvarg.com"].join("@");
}

function applyContactEmailLinks(root: ParentNode = document) {
	const email = getContactEmail();

	root.querySelectorAll<HTMLAnchorElement>("[data-contact-email]").forEach((link) => {
		if (link.dataset.contactEmailReady === "true") return;
		link.dataset.contactEmailReady = "true";
		link.href = `mailto:${email}`;

		const label = link.querySelector("[data-contact-email-label]");
		if (label instanceof HTMLElement) {
			label.textContent = email;
		}
	});
}

document.addEventListener("astro:page-load", () => {
	applyContactEmailLinks();
});

applyContactEmailLinks();
