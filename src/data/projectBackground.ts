import { COLOR_BEIGE_2 } from "../config/designTokens";

export const defaultPageBackground =
	"linear-gradient(180deg, var(--color-beige-1) 0%, var(--color-beige-2) 100%)";

export const homePageBackground = "var(--color-home-bg)";

export function projectBackground(endColor: string) {
	return `linear-gradient(180deg, var(--color-beige-1) 0%, ${endColor} 100%)`;
}

export function getPageBgEnd(background: string = defaultPageBackground): string {
	if (background.includes("color-home-bg") || background.includes("#1c100d")) {
		return "#1c100d";
	}

	if (background.includes("var(--color-beige-2)")) {
		return COLOR_BEIGE_2;
	}

	const match = background.match(/,\s*(#[0-9a-fA-F]{3,8})\s*100%/);
	return match?.[1]?.toLowerCase() ?? COLOR_BEIGE_2;
}
