export function isInternalNavigationLink(link: HTMLAnchorElement) {
	if (link.origin !== location.origin) return false;
	if (link.hasAttribute("download")) return false;
	if (link.target && link.target !== "_self") return false;

	const url = new URL(link.href);
	if (url.pathname === location.pathname && url.hash) return false;

	return true;
}
