import type { APIRoute } from "astro";
import { siteUrl } from "../config/site";
import { projects } from "../data/projects";

export const prerender = true;

export const GET: APIRoute = () => {
	const paths = ["/", "/about", ...projects.map((project) => `/projects/${project.slug}`)];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
	.map(
		(path) => `  <url>
    <loc>${new URL(path, siteUrl).href}</loc>
  </url>`,
	)
	.join("\n")}
</urlset>`;

	return new Response(body, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
};
