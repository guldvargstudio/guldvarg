type EducationEntry = {
	years: string;
	title: string;
	description: string;
};

type ContactLink = {
	label: string;
	href: string;
	icon: "phone" | "bluesky" | "threads";
};

export const contactLinks: ContactLink[] = [
	{
		icon: "phone",
		label: "+46 72 703 7878",
		href: "tel:+46727037878",
	},
	{
		icon: "bluesky",
		label: "@guldvarg.bsky.social",
		href: "https://bsky.app/profile/guldvarg.bsky.social",
	},
	{
		icon: "threads",
		label: "@kristoferkristofer",
		href: "https://www.threads.net/@kristoferkristofer",
	},
];

export const skillsText = [
	"I've worked across most areas of digital design throughout my career, though UX, UI, design systems, and visual identity work have become recurring parts of my role. With a background in frontend development, I naturally enjoy bridging the gap between design and implementation.",
	"Over the years, I've contributed to projects across a wide range of industries and disciplines, giving me a strong ability to adapt, collaborate, and contribute strategically as well as creatively.",
	"I'm highly proficient in modern design tools, with Figma being my primary tool of choice today. I speak both Swedish and English fluently.",
];

export const backgroundText = [
	"I was born in Oslo, before moving to Luleå where I spent much of my childhood digging snow caves and exploring the outdoors.",
	"Today, I live in the Stockholm archipelago, on Ingarö, together with my wife, three children, and our cat. I value kindness, having fun, and science.",
];

export const education: EducationEntry[] = [
	{
		years: "2013 - 2014",
		title: "Hack Design",
		description:
			"User Experience, Interface Design, Interaction Design, Graphic Design, Typography",
	},
	{
		years: "2000 - 2001",
		title: "Konstfack & Beckmans",
		description:
			"I was hired as an assistant teacher to lecture about vector design, animations and interactivity for a few occasions.",
	},
	{
		years: "1998 - 1999",
		title: "RMI Berghs",
		description: "Influence Theory, Communication, Marketing",
	},
	{
		years: "1995 - 1997",
		title: "Mediagymnasiet",
		description: "Design, Media, Web, Radio & TV Production",
	},
];
