import type { ImageMetadata } from "astro";

import type { GridColumns, SectionGroup } from "../lib/projectAssets";
import { getProjectThumbnail } from "../lib/projectAssets";
import { projectBackground } from "./projectBackground";


export type ProjectQuote = {
	text: string;
	by: string;
};

export type ProjectMeta = {
	slug: string;
	title: string;
	thumbnail: ImageMetadata;
	years?: string;
	intro?: string;
	quote?: ProjectQuote;
	tags?: string[];
	background?: string;
	sectionOrder?: number[];
	sectionColumns?: Partial<Record<number, GridColumns>>;
	sectionGroups?: SectionGroup[];
	showOnHome?: boolean;
};

const projectEntries: Omit<ProjectMeta, "thumbnail">[] = [
	{
		slug: "ohgarden",
		title: "Oh!Garden",
		years: "2025 - Ongoing",
		intro:
			"Sweden's fastest growing gardening app with a flourishing community of passionate home gardeners. Oh!Garden is focused on making plant care simpler, more accessible, and visually engaging for everyday users. The experience combines practical gardening tools with a warm and playful interface, helping users keep track of their plants without feeling overwhelmed by complexity.\nMy work spans UX, UI, and the visual system, shaping both the brand and the overall product direction.",
		quote: {
			text: "Kristofer is a highly skilled UX/UI designer with a strong combination of creativity, structure, and systematic thinking. He laid the foundation for our design system and significantly elevated both the team and the product.\nHe works very efficiently and consistently delivers solutions that exceed expectations — both through the quality of the details and the overall user experience.",
			by: "Anna Dymling, Founder, Oh!Garden",
		},
		tags: ["Art Direction", "UI / UX", "Design system", "Web", "iOS", "Android", "User Interviews"],
		background: projectBackground("#D3D9CF"),
	},
	{
		slug: "siggesta",
		title: "Siggesta Gård",
		years: "2023 - Ongoing",
		intro:
			"One of Stockholm's most established countryside destinations, bringing together accommodation, restaurants, conferences, activities, and events into a unified hospitality experience.\nI designed and developed the complete website in Webflow, including a flexible CMS setup built to support a large and continuously changing content ecosystem.",
		quote: {
			text: "Kristofer is responsible for Siggesta Gård's website — from design and development to ongoing maintenance. He is detail-oriented, proactive, and solution-driven, with a genuine eye for design. Kristofer is not afraid to challenge and improve existing ideas, and it clearly shows in the final result.",
			by: "Lisa Guldvarg, Marketing Director, Siggesta Gård",
		},
		tags: ["Art Direction", "UI / UX", "CMS", "HTML & CSS", "Webflow"],
		background: projectBackground("#EBE7E0"),
	},
	{
		slug: "mostwanted",
		title: "Most Wanted",
		years: "2014 - 2026",
		intro:
			"A quirky game built around a persistent 24/7 gameplay loop. Players hunted rivals, climbed the ranks, and fought to survive as the world’s most wanted outlaw. While highly addictive for the few who discovered it, the concept ultimately proved too unconventional to market to a broader audience.",
		quote: {
			text: "This game won't let me sleep anymore. Being hunted constantly. We have to shut the shit down!",
			by: "Fille, Developer, IMGNRY",
		},
		tags: ["Game concept", "Art Direction", "SFX", "Marketing", "UI / UX", "iOS"],
		background: projectBackground("#F7E7CA"),
	},
	{
		slug: "library",
		title: "Kungliga Biblioteket",
		years: "2023 - 2024",
		intro:
			"The Swedish National Library Authority, also known as Kungliga Biblioteket, entrusted me with rebranding and reinventing the user experience of their most prominent service, Libris. The primary goal was to create a search experience that gives both librarians and the public a clear, intuitive way to find books and check their availability at local libraries.",
		quote: {
			text: "Kristofer has laid the foundation for the form and design of our new Libris search exceptionally. It's evident that he enjoys what he does! He is serious, systematic, and motivated, and with his extensive experience, he listens curiously to feedback from others. Creativity combined with an eye for detail means that he delivers well-thought-out solutions beyond expectations.",
			by: "Maria Kadesjö, Head of Development and Design, National Library of Sweden",
		},
		tags: ["Art Direction", "UI / UX", "Design system", "Web", "User Interviews"],
		background: projectBackground("#dceae5"),
	},
	{
		slug: "picular",
		title: "Picular",
		years: "2014 - 2024",
		intro:
			"Picular was a deeply ambitious product vision: a next-generation photo organization platform created by a team of two. Competing against giants like Google, Apple, Adobe, and Microsoft may have sounded unrealistic — yet in several areas, the experience genuinely surpassed them. Available across Mac, PC, iOS, and Android, the project eventually came to an end when my co-founder lost faith in its future.",
		quote: {
			text: "Great tools for organizing and improving my database of thousands of photos over a long life. Fille and Kristofer have patiently answered every question.",
			by: "Inger Kari Nerheim, Happy customer",
		},
		tags: ["Art Direction", "Concept", "Marketing", "UI / UX", "iOS", "Android", "Mac", "PC"],
		background: projectBackground("#c8c3be"),
	},
	{
		slug: "halebop",
		title: "Halebop",
		years: "2022 - 2023",
		intro:
			"Sweden's happiest telecom company! During my year, I created a new design system to optimize, modernize, and streamline their solid visual brand. I also redesigned most of their main pages, including the payment flow. I coordinated the work with other designers and held regular meetings with two development teams.",
		quote: {
			text: "Kristofer was given the project scope to establish a new design system for Halebop and ended up not only delivering above and beyond the original scope, but he also became a core contributor in the Halebop team. His approach was refreshing and integral to where Halebop is today.",
			by: "Emma Craig, Head of halebop",
		},
		tags: ["Art Direction", "UI / UX", "Design system", "Web", "iOS", "Android", "User Interviews"],
		background: projectBackground("#E2F3EF"),
	},
	{
		slug: "soundtrack",
		title: "Soundtrack",
		years: "2019 - 2022",
		intro:
			"Soundtrack, known initially as Spotify For Business, is a comprehensive music service that provides a legal way to play music in public spaces. I designed the entire product for over two years. This included building a design system and streamlining the creation of thousands of playlist covers without compromising quality. The work also involved creating smooth onboarding, checkout, advanced subscription solutions, and music scheduling.",
		quote: {
			text: "With an eye for detail and a comprehensive systematic approach to problem solving and design, Kristofer is a very valuable contributor to both product solutions and as a team player. His long experience is also reflected in his humble approach and very likeable personality.",
			by: "Patrik Axelsson, VP Product, Soundtrack",
		},
		tags: ["Art Direction", "UI / UX", "Design system", "Icons", "Cover art", "Web", "iOS", "Android", "User Interviews"],
		background: projectBackground("#D6D6D6"),
	},
	{
		slug: "tui",
		title: "Tui",
		years: "2017 - 2019",
		intro:
			"TUI, the world's largest leisure travel company, entrusted me to design the Nordic web and email experience during a transformative three-year period for the brand. My work spanned UI, UX, design system, and conversion-focused improvements, helping modernize and elevate the overall customer experience. I also helped build and shape the Nordic UX team, which during this period was appointed \"Center of Excellence\" on a global TUI level.",
		quote: {
			text: "Kristofer is one of a kind. Wise, experienced and at the same time all-seeing and curious. With integrity and laser precision, he always delivers beyond expectations.",
			by: "Martin Collsiöö, UX Lead, TUI",
		},
		tags: ["UI / UX", "Art Direction", "Design system", "Web", "Email / crm"],
		background: projectBackground("#89D4F6"),
	},
	{
		slug: "comhem",
		title: "Com Hem",
		years: "2015 - 2017",
		intro:
			"For two years, I redesigned every page of the Com Hem website as part of their significant rebranding effort. I was responsible for transitioning the brand online from cheerful to premium, with a new logo and graphic profile that I also helped develop. This epic journey included an advanced checkout process and customer pages, allowing customers to tailor their TV, broadband, and telephony needs.",
		quote: {
			text: "Kristofer is always full of creative ideas and positive energy. He creates awesome designs and user flows, seeks and listen to feedback. He's really good to sell and explain his ideas and show how they fit in the bigger picture.",
			by: "Kristina Trossmo, Agile Coach, Com Hem",
		},
		tags: ["Art Direction", "UI / UX", "Design system", "Web"],
		background: projectBackground("#D4DDD4"),
	},
	{
		slug: "cocktailcruise",
		title: "Cocktail Cruise",
		years: "2014 - 2017",
		intro:
			"Capture the flag in a vibrant neon arcade '80s atmosphere. Originally released for iOS, the game turned your iPad into the game board while you and your friends controlled your ships with iPhones. Up to 8 players could join for total mayhem.\nWe later started developing a more polished version for Steam, but unfortunately it was never released.",
		quote: {
			text: "Very underrated game! There are not many apps like this one on the App Store 👌. This game was definitely very ahead of its time. The concept, and design goes hand in hand with its awesome sound tracks as well.",
			by: "Oreoninja22, Random customer, Apple App Store",
		},
		tags: ["Game concept", "Art Direction", "SFX", "Marketing", "UI / UX", "iOS", "Steam"],
		background: projectBackground("#ffedfb"),
	},
	{
		slug: "nordea",
		title: "Nordea",
		years: "2015 - 2016",
		intro:
			"My previous company, IMGNRY, was hired to design and develop a new iOS app for Nordea and their product, Räntebevis. The app featured advanced portfolio tools, live rate updates, news, and market information tailored to investors. I was responsible for the UI and UX design throughout the project, while also leading the collaboration and day-to-day communication with Nordea.",
		quote: {
			text: "It has been an excellent decision to work with IMGNRY as they have continuously delivered high quality on time. It's a pleasure to work with Kristofer and Fille - they always see solutions, not problems.",
			by: "Rita Mansourati, Product Marketing Manager, Nordea Markets",
		},
		tags: ["UI / UX", "Art Direction", "iOS", "Android", "Project management"],
		background: projectBackground("#f4f2ed"),
	},
	{
		slug: "wars",
		title: "Wars",
		years: "2012 - 2015",
		intro:
			"Wars was a multiplayer strategy game for Steam, combining real-time and turn-based mechanics. The project went through several successful beta tests before development gradually faded out as other projects and commitments unfortunately began taking over. I still believe the game had a great deal of potential.",
		quote: {
			text: "Compelling game, the balance of units with different 'tick rates' and abilities provides interesting choices.\n\nThe total play area was big enough to provide an interesting scale and time to respond.",
			by: "Deep Bluezen, Beta Tester",
		},
		tags: ["Game concept", "Art Direction", "SFX", "UI / UX", "Steam"],
		background: projectBackground("#D6F0C2"),
		sectionGroups: [
			{ files: ["1a"] },
			{ files: ["1b", "2a"], columns: "equal" },
			{ files: ["2b"] },
		],
		showOnHome: false,
	},
	{
		slug: "holy",
		title: "The Holy Hand Grenade",
		years: "2012 - 2014",
		intro:
			"Let there be light — and there was light. Holy Handgrenade was a quirky iOS game where players competed in once-a-day reaction battles, trying to outlast a global leaderboard in chaotic last-man-standing tournaments.\nThe game was available on the app store for several years before ultimately coming to an end alongside the closing chapter of IMGNRY.",
		quote: {
			text: "The Holy Hand Grenade distils competitive gaming into a short and sharp single game experience.",
			by: "Chris Priestman, Pocket Gamer",
		},
		tags: ["Game concept", "Art Direction", "SFX", "Marketing", "UI / UX", "iOS"],
		background: projectBackground("#D8F3FD"),
	},
];

export const projects: ProjectMeta[] = projectEntries.map((project) => ({
	...project,
	thumbnail: getProjectThumbnail(project.slug),
}));

export function getHomeProjects() {
	return projects.filter((project) => project.showOnHome !== false);
}

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
	return projects.find((project) => project.slug === slug);
}

