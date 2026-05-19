import type { ImageMetadata } from "astro";

export type GridColumns = "equal" | "2-1" | "1-2";

export type ProjectSection =
	| { type: "single"; id: number; image: ImageMetadata }
	| { type: "grid"; id: number; images: ImageMetadata[]; columns?: GridColumns };

type ParsedFile = {
	section: number;
	suffix?: string;
	image: ImageMetadata;
};

const projectImages = import.meta.glob<{ default: ImageMetadata }>(
	"../assets/projects/**/*.{png,jpg,jpeg}",
	{ eager: true },
);

function parseImagePath(path: string): Omit<ParsedFile, "image"> | null {
	const match = path.match(/\/projects\/([^/]+)\/p-[^/]+-([^.]+)\.(png|jpe?g)$/i);
	if (!match) return null;

	const rest = match[2];
	if (rest === "thumbnail") return null;

	const gridMatch = rest.match(/^(\d+)([a-f])$/i);
	if (gridMatch) {
		return {
			section: Number(gridMatch[1]),
			suffix: gridMatch[2].toLowerCase(),
		};
	}

	const singleMatch = rest.match(/^(\d+)$/);
	if (singleMatch) {
		return {
			section: Number(singleMatch[1]),
		};
	}

	return null;
}

export function parseProjectImages(
	slug: string,
	sectionOrder?: number[],
	sectionColumns?: Partial<Record<number, GridColumns>>,
): ProjectSection[] {
	const files: ParsedFile[] = [];

	for (const [path, module] of Object.entries(projectImages)) {
		if (!path.includes(`/projects/${slug}/`)) continue;

		const parsed = parseImagePath(path);
		if (!parsed) continue;

		files.push({ ...parsed, image: module.default });
	}

	const grouped = new Map<number, ParsedFile[]>();

	for (const file of files) {
		const group = grouped.get(file.section) ?? [];
		group.push(file);
		grouped.set(file.section, group);
	}

	const sectionIds = sectionOrder ?? [...grouped.keys()].sort((a, b) => a - b);

	return sectionIds
		.filter((id) => grouped.has(id))
		.map((id) => {
			const group = grouped.get(id)!;
			const sorted = [...group].sort((a, b) =>
				(a.suffix ?? "").localeCompare(b.suffix ?? ""),
			);

			if (sorted.length === 1 && !sorted[0].suffix) {
				return { type: "single", id, image: sorted[0].image } satisfies ProjectSection;
			}

			const columns = sectionColumns?.[id] ?? "equal";

			return {
				type: "grid",
				id,
				images: sorted.map((item) => item.image),
				columns: sorted.length === 2 ? columns : "equal",
			} satisfies ProjectSection;
		});
}
