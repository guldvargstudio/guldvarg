import type { ImageMetadata } from "astro";

export type SiteSeo = {
	title?: string;
	description?: string;
	image?: ImageMetadata | string;
	imageAlt?: string;
	canonicalPath?: string;
	type?: "website" | "article";
};
