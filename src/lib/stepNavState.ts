export type StepNavVisualState = {
	active: "home" | "about" | "project";
	activeDotIndex?: number;
};

const STATE_ELEMENT_ID = "step-nav-state";

function parseDotIndex(value: string | undefined): number | undefined {
	if (value === undefined || value === "") return undefined;
	const index = Number(value);
	return Number.isFinite(index) ? index : undefined;
}

function readFromElement(element: HTMLElement): StepNavVisualState {
	const { stepNavActive, stepNavDot } = element.dataset;

	return {
		active: (stepNavActive as StepNavVisualState["active"]) ?? "home",
		activeDotIndex: parseDotIndex(stepNavDot),
	};
}

export function readStepNavVisualState(doc: Document = document): StepNavVisualState {
	const stateElement = doc.getElementById(STATE_ELEMENT_ID);

	if (stateElement instanceof HTMLElement) {
		return readFromElement(stateElement);
	}

	return readFromElement(doc.body);
}
