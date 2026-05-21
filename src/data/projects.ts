import type { ImageMetadata } from "astro";

import type { GridColumns, SectionGroup } from "../lib/projectAssets";

import cocktailcruiseThumb from "../assets/projects/cocktailcruise/p-cocktailcruise-thumbnail.png";
import comhemThumb from "../assets/projects/comhem/p-comhem-thumbnail.png";
import halebopThumb from "../assets/projects/halebop/p-halebop-thumbnail.png";
import holyThumb from "../assets/projects/holy/p-holy-thumbnail.png";
import libraryThumb from "../assets/projects/library/p-library-thumbnail.png";
import mostwantedThumb from "../assets/projects/mostwanted/p-mostwanted-thumbnail.png";
import nordeaThumb from "../assets/projects/nordea/p-nordea-thumbnail.png";
import ohgardenThumb from "../assets/projects/ohgarden/p-ohgarden-thumbnail.png";
import picularThumb from "../assets/projects/picular/p-picular-thumbnail.png";
import siggestaThumb from "../assets/projects/siggesta/p-siggesta-thumbnail.png";
import soundtrackThumb from "../assets/projects/soundtrack/p-soundtrack-thumbnail.png";
import tuiThumb from "../assets/projects/tui/p-tui-thumbnail.png";
import warsThumb from "../assets/projects/wars/p-wars-thumbnail.png";

export type ProjectQuote = {
	text: string;
	by: string;
};

export type ProjectMeta = {
	slug: string;
	title: string;
	thumbnail: ImageMetadata;
	years?: string;
	role?: string;
	intro?: string;
	quote?: ProjectQuote;
	tags?: string[];
	background?: string;
	sectionOrder?: number[];
	sectionColumns?: Partial<Record<number, GridColumns>>;
	sectionGroups?: SectionGroup[];
	showOnHome?: boolean;
};

const defaultBackground =
	"linear-gradient(180deg, var(--color-beige-1) 0%, var(--color-beige-2) 100%)";

export const defaultPageBackground = defaultBackground;

function bg(endColor: string) {
	return `linear-gradient(180deg, var(--color-beige-1) 0%, ${endColor} 100%)`;
}

export function getPageBgEnd(background: string = defaultPageBackground): string {
	if (background.includes("var(--color-beige-2)")) {
		return "#f2ebd9";
	}

	const match = background.match(/,\s*(#[0-9a-fA-F]{3,8})\s*100%/);
	return match?.[1] ?? "#f2ebd9";
}

export const projects: ProjectMeta[] = [
	{
		slug: "ohgarden",
		title: "Oh!Garden",
		thumbnail: ohgardenThumb,
		years: "2025 - today",
		role: "UX / UI designer",
		intro:
			"Sweden's fastest growing gardening app with a flourishing community of passionate home gardeners. Oh!Garden is focused on making plant care simpler, more accessible, and visually engaging for everyday users. The experience combines practical gardening tools with a warm and playful interface, helping users keep track of their plants without feeling overwhelmed by complexity.\nMy work spans UX, UI, and the visual system, shaping both the brand and the overall product direction.",
		quote: {
			text: "This game won't let me sleep anymore. Being hunted constantly. We have to shut the shit down!",
			by: "Fille, Developer, IMGNRY",
		},
		tags: ["Rebranding", "Art Direction", "UI / UX", "Design system", "Web", "iOS", "Android"],
		background: bg("#D3D9CF"),
	},
	{
		slug: "siggesta",
		title: "Siggesta Gård",
		thumbnail: siggestaThumb,
		years: "2023 - today",
		role: "UX / UI designer & webflow developer",
		intro:
			"One of Stockholm's most established countryside destinations, bringing together accommodation, restaurants, conferences, activities, and events into a unified hospitality experience.\nI designed and developed the complete website in Webflow, including a flexible CMS setup built to support a large and continuously changing content ecosystem.",
		quote: {
			text: "Kristofer is responsible for Siggesta Gård's website — from design and development to ongoing maintenance. He is detail-oriented, proactive, and solution-driven, with a genuine eye for design. Kristofer is not afraid to challenge and improve existing ideas, and it clearly shows in the final result.",
			by: "Lisa Guldvarg, Marketing Director, Siggesta Gård",
		},
		tags: ["Art Direction", "UI / UX", "CMS", "HTML & CSS", "Webflow"],
		background: bg("#EBE7E0"),
	},
	{
		slug: "mostwanted",
		title: "Most Wanted",
		thumbnail: mostwantedThumb,
		years: "2014 - 2026",
		role: "Co-Founder & designer",
		intro:
			"A quirky game built around a persistent 24/7 gameplay loop. Players hunted rivals, climbed the ranks, and fought to survive as the world’s most wanted outlaw. While highly addictive for the few who discovered it, the concept ultimately proved too unconventional to market to a broader audience.",
		quote: {
			text: "This game won't let me sleep anymore. Being hunted constantly. We have to shut the shit down!",
			by: "Fille, Developer, IMGNRY",
		},
		tags: ["Game concept", "Art Direction", "SFX", "Marketing", "UI / UX", "iOS"],
		background: bg("#F7E7CA"),
	},
	{
		slug: "picular",
		title: "Picular",
		thumbnail: picularThumb,
		years: "2014 - 2024",
		role: "Co-Founder & designer",
		intro:
			"Picular was a deeply ambitious product vision: a next-generation photo organization platform created by a team of two. Competing against giants like Google, Apple, Adobe, and Microsoft may have sounded unrealistic — yet in several areas, the experience genuinely surpassed them. Available across Mac, PC, iOS, and Android, the project eventually came to an end when my co-founder lost faith in its future.",
		quote: {
			text: "Great tools for organizing and improving my database of thousands of photos over a long life. Fille and Kristofer have patiently answered every question.",
			by: "Inger Kari Nerheim, Happy customer",
		},
		tags: ["Art Direction", "Concept", "Marketing", "UI / UX", "iOS", "Android", "Mac", "PC"],
		background: bg("#c8c3be"),
	},
	{
		slug: "library",
		title: "Kungliga Biblioteket",
		thumbnail: libraryThumb,
		years: "2023 - 2024",
		role: "ux / ui designer",
		intro:
			"The Swedish National Library Authority, also known as Kungliga Biblioteket, entrusted me with rebranding and reinventing the user experience of their most prominent service, Libris. The primary goal was to create a search experience that gives both librarians and the public a clear, intuitive way to find books and check their availability at local libraries.",
		quote: {
			text: "Kristofer has laid the foundation for the form and design of our new Libris search exceptionally. It's evident that he enjoys what he does! He is serious, systematic, and motivated, and with his extensive experience, he listens curiously to feedback from others. Creativity combined with an eye for detail means that he delivers well-thought-out solutions beyond expectations.",
			by: "Maria Kadesjö, Head of Development and Design, National Library of Sweden",
		},
		tags: ["Rebranding", "UI / UX", "Design system", "Web", "User testing"],
		background: bg("#dceae5"),
	},
	{
		slug: "halebop",
		title: "Halebop",
		thumbnail: halebopThumb,
		years: "2022 - 2023",
		role: "ux / ui designer",
		intro:
			"Sweden's happiest telecom company! During my year, I created a new design system to optimize, modernize, and streamline their solid visual brand. I also redesigned most of their main pages, including the payment flow. I coordinated the work with other designers and held regular meetings with two development teams.",
		quote: {
			text: "Kristofer was given the project scope to establish a new design system for Halebop and ended up not only delivering above and beyond the original scope, but he also became a core contributor in the Halebop team. His approach was refreshing and integral to where Halebop is today.",
			by: "Emma Craig, Head of halebop",
		},
		tags: ["Art Direction", "UI / UX", "Design system", "Web", "iOS", "Android", "User testing"],
		background: bg("#E2F3EF"),
	},
	{
		slug: "soundtrack",
		title: "Soundtrack",
		thumbnail: soundtrackThumb,
		years: "2019 - 2022",
		role: "ux / ui designer",
		intro:
			"Soundtrack, known initially as Spotify For Business, is a comprehensive music service that provides a legal way to play music in public spaces. I designed the entire product for over two years. This included building a design system and streamlining the creation of thousands of playlist covers without compromising quality. The work also involved creating smooth onboarding, checkout, advanced subscription solutions, and music scheduling.",
		quote: {
			text: "With an eye for detail and a comprehensive systematic approach to problem solving and design, Kristofer is a very valuable contributor to both product solutions and as a team player. His long experience is also reflected in his humble approach and very likeable personality.",
			by: "Patrik Axelsson, VP Product, Soundtrack",
		},
		tags: ["Art Direction", "UI / UX", "Design system", "Icons", "Cover art", "Web", "iOS", "Android", "User testing"],
		background: bg("#D6D6D6"),
	},
	{
		slug: "tui",
		title: "Tui",
		thumbnail: tuiThumb,
		years: "2017 - 2019",
		role: "ux / ui designer",
		intro:
			"TUI, the world's largest leisure travel company, entrusted me to design the Nordic web and email experience during a transformative three-year period for the brand. My work spanned UI, UX, design system, and conversion-focused improvements, helping modernize and elevate the overall customer experience. I also helped build and shape the Nordic UX team, which during this period was appointed \"Center of Excellence\" on a global TUI level.",
		quote: {
			text: "Kristofer is one of a kind. Wise, experienced and at the same time all-seeing and curious. With integrity and laser precision, he always delivers beyond expectations.",
			by: "Martin Collsiöö, UX Lead, TUI",
		},
		tags: ["UI / UX", "Art Direction", "Design system", "Web", "Email / crm"],
		background: bg("#89D4F6"),
	},
	{
		slug: "cocktailcruise",
		title: "Cocktail Cruise",
		thumbnail: cocktailcruiseThumb,
		years: "2022 - 2023",
		role: "Co-founder & designer",
		intro:
			"Capture the flag in a vibrant neon arcade '80s atmosphere. Originally released for iOS, the game turned your iPad into the game board while you and your friends controlled your ships with iPhones. Up to 8 players could join for total mayhem.\nWe later started developing a more polished version for Steam, but unfortunately it was never released.",
		quote: {
			text: "⭐️⭐️⭐️⭐️⭐️\nVery underrated game! There are not many apps like this one on the App Store 👌. This game was definitely very ahead of its time. The concept, and design goes hand in hand with its awesome sound tracks as well.",
			by: "Oreoninja22, Random customer, Apple App Store",
		},
		tags: ["Game concept", "Art Direction", "SFX", "Marketing", "UI / UX", "iOS", "Steam"],
		background: bg("#ffedfb"),
	},
	{
		slug: "comhem",
		title: "Com Hem",
		thumbnail: comhemThumb,
		years: "2015 - 2017",
		role: "ux / ui designer",
		intro:
			"For two years, I redesigned every page of the Com Hem website as part of their significant rebranding effort. I was responsible for transitioning the brand online from cheerful to premium, with a new logo and graphic profile that I also helped develop. This epic journey included an advanced checkout process and customer pages, allowing customers to tailor their TV, broadband, and telephony needs.",
		quote: {
			text: "Kristofer is always full of creative ideas and positive energy. He creates awesome designs and user flows, seeks and listen to feedback. He's really good to sell and explain his ideas and show how they fit in the bigger picture.",
			by: "Kristina Trossmo, Agile Coach, Com Hem",
		},
		tags: ["Rebranding", "Art Direction", "UI / UX", "Design system", "Web"],
		background: bg("#D4DDD4"),
	},
	{
		slug: "holy",
		title: "The Holy Hand Grenade",
		thumbnail: holyThumb,
		years: "2012 - 2014",
		role: "Co-Founder & designer",
		intro:
			"Let there be light — and there was light. Holy Handgrenade was a quirky iOS game where players competed in once-a-day reaction battles, trying to outlast a global leaderboard in chaotic last-man-standing tournaments.\nThe game was available on the app store for several years before ultimately coming to an end alongside the closing chapter of IMGNRY.",
		quote: {
			text: "The Holy Hand Grenade distils competitive gaming into a short and sharp single game experience.",
			by: "Chris Priestman, Pocket Gamer",
		},
		tags: ["Game concept", "Art Direction", "SFX", "Marketing", "UI / UX", "iOS"],
		background: bg("#D8F3FD"),
	},
	{
		slug: "nordea",
		title: "Nordea",
		thumbnail: nordeaThumb,
		years: "2015 - 2016",
		role: "ux / ui designer",
		intro:
			"My previous company, IMGNRY, was hired to design and develop a new iOS app for Nordea and their product, Räntebevis. The app featured advanced portfolio tools, live rate updates, news, and market information tailored to investors. I was responsible for the UI and UX design throughout the project, while also leading the collaboration and day-to-day communication with Nordea.",
		quote: {
			text: "It has been an excellent decision to work with IMGNRY as they have continuously delivered high quality on time. It's a pleasure to work with Kristofer and Fille - they always see solutions, not problems.",
			by: "Rita Mansourati, Product Marketing Manager, Nordea Markets",
		},
		tags: ["UI / UX", "Art Direction", "iOS", "Android", "Project management"],
		background: bg("#f4f2ed"),
	},
	{
		slug: "wars",
		title: "Wars",
		thumbnail: warsThumb,
		years: "2012 - 2015",
		role: "Co-Founder & designer",
		intro:
			"Wars was a multiplayer strategy game for Steam, combining real-time and turn-based mechanics. The project went through several successful beta tests before development gradually faded out as other projects and commitments unfortunately began taking over. I still believe the game had a great deal of potential.",
		quote: {
			text: "Compelling game, the balance of units with different 'tick rates' and abilities provides interesting choices.\n\nThe total play area was big enough to provide an interesting scale and time to respond.",
			by: "Deep Bluezen, Beta Tester",
		},
		tags: ["Game concept", "Art Direction", "SFX", "UI / UX", "Steam"],
		background: bg("#fdf1d7"),
		sectionGroups: [
			{ files: ["1a"] },
			{ files: ["1b", "2a"], columns: "equal" },
			{ files: ["2b"] },
		],
		showOnHome: false,
	},




];

export type ProjectListing = Pick<ProjectMeta, "slug" | "title" | "thumbnail">;

export function getHomeProjects() {
	return projects.filter((project) => project.showOnHome !== false);
}

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
	return projects.find((project) => project.slug === slug);
}

export function getProjectNavigation(slug: string) {
	const index = projects.findIndex((project) => project.slug === slug);
	if (index === -1) return null;

	const prev = projects[(index - 1 + projects.length) % projects.length];
	const next = projects[(index + 1) % projects.length];

	return { index, prev, next };
}

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
