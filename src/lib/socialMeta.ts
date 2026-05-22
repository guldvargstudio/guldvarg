import type { ImageMetadata } from "astro";

import type { ProjectMeta } from "../data/projects";

export const siteName = "Guldvarg Studio";

export const defaultSiteDescription =
	"Guldvarg Studio — Selected Work by Kristofer Guldvarg";

export const defaultOgImage = "/og-image.png";

export function truncateDescription(text: string, maxLength = 160): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getProjectShareDescription(project: ProjectMeta): string {
	const source =
		project.intro?.split("\n").find((paragraph) => paragraph.trim()) ??
		project.quote?.text.split("\n").find((paragraph) => paragraph.trim()) ??
		`${project.title} — portfolio project by ${siteName}`;

	return truncateDescription(source);
}

export function toAbsoluteUrl(path: string, site: URL | string): string {
	return new URL(path, site).href;
}

export function toImageUrl(image: ImageMetadata, site: URL | string): string {
	return toAbsoluteUrl(image.src, site);
}
