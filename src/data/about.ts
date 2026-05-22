type EducationEntry = {
	years: string;
	title: string;
	description: string;
};

type ContactLink = {
	label: string;
	href: string;
	icon: "email" | "phone" | "bluesky" | "threads";
};

export const contactLinks: ContactLink[] = [
	{
		icon: "email",
		label: "kristofer@guldvarg.com",
		href: "mailto:kristofer@guldvarg.com",
	},
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
	"I've specialized in UX, UI, design systems, and cohesive visual identities, always eager to learn and adapt. My long experience and broad knowledge allows me to contribute meaningfully in a collaborative and constantly evolving industry.",
	"I'm a fluid user of all well-known UI/UX tools, and my current main tool I've come to master is Figma.",
	"I speak Swedish & English.",
];

export const backgroundText =
	"I was born in 1978 in Olso but soon moved to Luleå, where I spent my early childhood digging snow caves. Nowadays, I live in the archipelago, Ingarö, outside Stockholm, with my wife, three kids, and a cat. I value kindness, having fun, and science.";

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
