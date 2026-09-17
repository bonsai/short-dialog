import type { ShortDialog } from "./core.js";

export type RenderOptions = {
  width?: number;
  height?: number;
  fps?: number;
  output: string;
};

/**
 * Renderer contract. The implementation should use ffmpeg to produce
 * a 9:16 MP4 from the ShortDialog timeline.
 */
export async function render(short: ShortDialog, options: RenderOptions) {
  void short;
  void options;
  throw new Error("Renderer not implemented yet: connect ffmpeg here");
}
