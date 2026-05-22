import { projects } from "./projects";

export type SiteNavigation = {
	active: "home" | "about" | "project";
	activeDotIndex?: number;
	dotCount: number;
	prevHref: string;
	nextHref: string;
};

export function getSiteNavigation(current: "home" | "about" | { slug: string }): SiteNavigation {
	const dotCount = projects.length;
	const firstProject = projects[0];
	const lastProject = projects[projects.length - 1];

	if (current === "home") {
		return {
			active: "home",
			dotCount,
			prevHref: "/about",
			nextHref: `/projects/${firstProject.slug}`,
		};
	}

	if (current === "about") {
		return {
			active: "about",
			dotCount,
			prevHref: `/projects/${lastProject.slug}`,
			nextHref: "/",
		};
	}

	const index = projects.findIndex((project) => project.slug === current.slug);
	if (index === -1) {
		throw new Error(`Unknown project slug: ${current.slug}`);
	}

	return {
		active: "project",
		activeDotIndex: index,
		dotCount,
		prevHref: index === 0 ? "/" : `/projects/${projects[index - 1].slug}`,
		nextHref:
			index === projects.length - 1 ? "/about" : `/projects/${projects[index + 1].slug}`,
	};
}
