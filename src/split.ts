import type { Dialog, Short } from "./types.js";

export const DEFAULT_TOTAL_SECONDS = 80;
export const DEFAULT_SHORT_SECONDS = 20;

export function splitDialog(
  dialog: Dialog,
  shortSeconds = DEFAULT_SHORT_SECONDS,
  totalSeconds = DEFAULT_TOTAL_SECONDS,
): Short[] {
  if (dialog.duration !== totalSeconds) {
    throw new Error(`Dialog duration must be ${totalSeconds}s; got ${dialog.duration}s`);
  }

  const count = Math.ceil(totalSeconds / shortSeconds);

  return Array.from({ length: count }, (_, i) => {
    const start = i * shortSeconds;
    const end = Math.min(start + shortSeconds, totalSeconds);

    const messages = dialog.messages
      .filter((m) => m.start < end && m.end > start)
      .map((m) => ({
        ...m,
        start: Math.max(0, m.start - start),
        end: Math.min(end, m.end) - start,
      }));

    return {
      id: `${dialog.id}-${String(i + 1).padStart(2, "0")}`,
      index: i + 1,
      start,
      end,
      duration: end - start,
      messages,
    };
  });
}
