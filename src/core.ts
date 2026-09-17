export type Speaker = "left" | "right";

export type Message = {
  id: string;
  start: number;
  end: number;
  speaker: Speaker;
  text: string;
};

export type Dialog = {
  duration: 80;
  title?: string;
  messages: Message[];
};

export type ShortDialog = {
  id: string;
  index: number;
  start: number;
  end: number;
  duration: 20;
  messages: Message[];
};

export function validate(dialog: Dialog): void {
  if (dialog.duration !== 80) throw new Error("dialog.duration must be 80 seconds");
  for (const m of dialog.messages) {
    if (m.start < 0 || m.end > 80 || m.start >= m.end) {
      throw new Error(`Invalid timing: ${m.id}`);
    }
  }
}

export function split(dialog: Dialog): ShortDialog[] {
  validate(dialog);
  return Array.from({ length: 4 }, (_, i) => {
    const start = i * 20;
    const end = start + 20;
    return {
      id: `short-${String(i + 1).padStart(2, "0")}`,
      index: i + 1,
      start,
      end,
      duration: 20,
      messages: dialog.messages
        .filter((m) => m.start < end && m.end > start)
        .map((m) => ({
          ...m,
          start: Math.max(0, m.start - start),
          end: Math.min(20, m.end - start),
        })),
    };
  });
}
