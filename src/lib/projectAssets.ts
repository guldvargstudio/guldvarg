import type { ImageMetadata } from "astro";

export type GridColumns = "equal" | "2-1" | "1-2";

export type SectionGroup = {
	files: string[];
	columns?: GridColumns;
};

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

export function getProjectThumbnail(slug: string): ImageMetadata {
	const entry = Object.entries(projectImages).find(
		([path]) => path.includes(`/projects/${slug}/`) && path.includes("-thumbnail."),
	);

	if (!entry) {
		throw new Error(`Missing thumbnail for project: ${slug}`);
	}

	return entry[1].default;
}

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

function fileKey(file: Omit<ParsedFile, "image">) {
	return file.suffix ? `${file.section}${file.suffix}` : String(file.section);
}

function getProjectImageFiles(slug: string): ParsedFile[] {
	const files: ParsedFile[] = [];

	for (const [path, module] of Object.entries(projectImages)) {
		if (!path.includes(`/projects/${slug}/`)) continue;

		const parsed = parseImagePath(path);
		if (!parsed) continue;

		files.push({ ...parsed, image: module.default });
	}

	return files;
}

export function getProjectOgImage(
	slug: string,
	sectionOrder?: number[],
	sectionColumns?: Partial<Record<number, GridColumns>>,
	sectionGroups?: SectionGroup[],
): ImageMetadata | undefined {
	const files = getProjectImageFiles(slug);
	const sectionOneSingle = files.find((file) => file.section === 1 && !file.suffix);
	if (sectionOneSingle) return sectionOneSingle.image;

	const sectionOneA = files.find((file) => file.section === 1 && file.suffix === "a");
	if (sectionOneA) return sectionOneA.image;

	const sections = parseProjectImages(slug, sectionOrder, sectionColumns, sectionGroups);
	const firstSection = sections[0];
	if (!firstSection) return undefined;

	return firstSection.type === "single" ? firstSection.image : firstSection.images[0];
}

export function parseProjectImages(
	slug: string,
	sectionOrder?: number[],
	sectionColumns?: Partial<Record<number, GridColumns>>,
	sectionGroups?: SectionGroup[],
): ProjectSection[] {
	const files = getProjectImageFiles(slug);
	if (sectionGroups) {
		const byKey = new Map(files.map((file) => [fileKey(file), file.image]));

		return sectionGroups.flatMap((group, index): ProjectSection[] => {
			const images = group.files
				.map((key) => byKey.get(key))
				.filter((image): image is ImageMetadata => image !== undefined);

			if (images.length === 0) return [];

			const id = index + 1;

			if (images.length === 1) {
				return [{ type: "single", id, image: images[0] } satisfies ProjectSection];
			}

			const columns =
				images.length === 2 ? (group.columns ?? "equal") : "equal";

			return [
				{
					type: "grid",
					id,
					images,
					columns,
				} satisfies ProjectSection,
			];
		});
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
