import { COLOR_HOME_BG } from "../config/designTokens";

export function isHomePage() {
	return (
		document.body.dataset.pageBgEnd === COLOR_HOME_BG ||
		document.querySelector(".home") !== null
	);
}
