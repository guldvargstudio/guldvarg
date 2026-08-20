import { COLOR_HOME_BG } from "../config/designTokens";

export function isHomePage() {
	return document.querySelector(".home") !== null;
}

export function hasHomeBackground() {
	return document.body.dataset.pageBgEnd === COLOR_HOME_BG;
}
