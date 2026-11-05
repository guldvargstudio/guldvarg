import { siteName, siteUrl } from "../config/site";

export const defaultSiteDescription =
	"Guldvarg Studio — Selected Work by Kristofer Guldvarg";

/** 1200×630 share card — dark brand mark for Google pills / social. */
export const defaultOgImage = "/og-image.png";
export const defaultOgImageWidth = 1200;
export const defaultOgImageHeight = 630;

/**
 * Square logo for Organization schema / Knowledge Graph.
 * Dark background baked in so Google never places the on-dark mark on white.
 */
export const organizationLogoPath = "/logo.png";
export const organizationLogoWidth = 1200;
export const organizationLogoHeight = 1200;

export { siteName, siteUrl };

export function toAbsoluteUrl(path: string, site: URL | string): string {
	return new URL(path, site).href;
}

export function toImageUrl(image: ImageMetadata, site: URL | string): string {
	return toAbsoluteUrl(image.src, site);
}

function getSiteOrigin(site: URL | string) {
	if (typeof site === "string") {
		return site.replace(/\/$/, "") || siteUrl;
	}

	return site.origin;
}

export function buildOrganizationJsonLd(site: URL | string) {
	const logoUrl = toAbsoluteUrl(organizationLogoPath, site);

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteName,
		url: getSiteOrigin(site),
		logo: {
			"@type": "ImageObject",
			url: logoUrl,
			width: organizationLogoWidth,
			height: organizationLogoHeight,
		},
		image: logoUrl,
		email: "kristofer@guldvarg.com",
		telephone: "+46-72-703-7878",
		sameAs: [
			"https://bsky.app/profile/guldvarg.bsky.social",
			"https://www.threads.net/@kristoferkristofer",
		],
	};
}

export function buildWebsiteJsonLd(site: URL | string) {
	const origin = getSiteOrigin(site);

	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteName,
		url: origin,
		publisher: {
			"@type": "Organization",
			name: siteName,
			logo: {
				"@type": "ImageObject",
				url: toAbsoluteUrl(organizationLogoPath, site),
			},
		},
	};
}

export function truncateDescription(text: string, maxLength = 160): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getProjectShareDescription(project: {
	title: string;
	intro?: string;
	quote?: { text: string };
}): string {
	const source =
		project.intro?.split("\n").find((paragraph) => paragraph.trim()) ??
		project.quote?.text.split("\n").find((paragraph) => paragraph.trim()) ??
		`${project.title} — portfolio project by ${siteName}`;

	return truncateDescription(source);
}
