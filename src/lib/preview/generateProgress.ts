/** Shared stage labels + percents for generate stream → loading UI. */

export const PREVIEW_GENERATE_STAGES = [
  {
    key: "collecting",
    label: "Collecting business information",
    percent: 12,
  },
  {
    key: "photos",
    label: "Understanding your photos",
    percent: 32,
  },
  {
    key: "researching",
    label: "Researching your company",
    percent: 52,
  },
  {
    key: "copy",
    label: "Writing conversion copy",
    percent: 70,
  },
  {
    key: "design",
    label: "Designing the custom layout",
    percent: 84,
  },
  {
    key: "pages",
    label: "Building home, services & about",
    percent: 94,
  },
] as const;

export type PreviewGenerateStageKey =
  (typeof PREVIEW_GENERATE_STAGES)[number]["key"];

export type PreviewProgressEvent = {
  type: "progress";
  stageIndex: number;
  stageKey: PreviewGenerateStageKey;
  label: string;
  percent: number;
};

export type PreviewDoneEvent = {
  type: "done";
  slug: string;
  previewUrl: string;
  status: "ready";
  pagesComplete: true;
  usedAi?: boolean;
  percent: 100;
};

export type PreviewErrorEvent = {
  type: "error";
  error: { code: string; message: string };
};

export type PreviewStreamEvent =
  | PreviewProgressEvent
  | PreviewDoneEvent
  | PreviewErrorEvent;

export function progressEvent(
  stageIndex: number
): PreviewProgressEvent {
  const stage =
    PREVIEW_GENERATE_STAGES[
      Math.max(0, Math.min(PREVIEW_GENERATE_STAGES.length - 1, stageIndex))
    ];
  return {
    type: "progress",
    stageIndex,
    stageKey: stage.key,
    label: stage.label,
    percent: stage.percent,
  };
}
